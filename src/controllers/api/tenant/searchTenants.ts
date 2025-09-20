import db, { property, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchTenantsSchema } from '@schemas';
import { and, eq, ilike, or } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const searchTenants: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const queryValidation = searchTenantsSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 20, search, isActive } = queryValidation.data;

    // Build query conditions - only show tenants for user's properties
    const conditions = [eq(property.userId, requestingUserId)];

    if (isActive !== undefined) {
      conditions.push(eq(tenant.isActive, isActive));
    }

    if (search) {
      const searchCondition = or(
        ilike(tenant.firstName, `%${search}%`),
        ilike(tenant.lastName, `%${search}%`),
        ilike(tenant.email, `%${search}%`),
        ilike(tenant.mobile, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Get tenants with pagination - only select essential fields for UI
    const tenants = await db
      .select({
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        mobile: tenant.mobile,
        isActive: tenant.isActive,
        leaseStartDate: tenant.leaseStartDate,
        property: {
          id: property.id,
          title: property.title,
          address: property.address,
          propertyType: property.propertyType,
        },
      })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(tenant.createdAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: tenant.id })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(and(...conditions));

    const totalTenants = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalTenants / limit);

    sendSuccessResponse(response, 200, 'Tenants retrieved successfully', {
      tenants,
      pagination: {
        page,
        limit,
        total: totalTenants,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
        isActive,
      },
    });
  } catch (error) {
    logError(error, 'SEARCH_TENANTS');
    sendErrorResponse(response, 500, 'Failed to search tenants.');
  }
};

export default searchTenants;
