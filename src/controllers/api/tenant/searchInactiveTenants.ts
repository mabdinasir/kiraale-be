import db, {
  property,
  rentPayment,
  securityDeposit,
  tenant,
  tenantDocument,
  tenantFamilyMember,
} from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchTenantsSchema } from '@schemas';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const searchInactiveTenants: RequestHandler = async (request, response) => {
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

    const { page = 1, limit = 20, search } = queryValidation.data;

    // Build query conditions - only show inactive tenants for user's properties
    const conditions = [eq(property.userId, requestingUserId), eq(tenant.isActive, false)];

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

    // Get tenants with pagination and counts - same structure as getMyTenants
    const tenants = await db
      .select({
        tenant,
        property: {
          id: property.id,
          title: property.title,
          address: property.address,
          propertyType: property.propertyType,
        },
        familyMembersCount: sql<number>`count(distinct ${tenantFamilyMember.id})::int`,
        paymentsCount: sql<number>`count(distinct ${rentPayment.id})::int`,
        depositsCount: sql<number>`count(distinct ${securityDeposit.id})::int`,
        documentsCount: sql<number>`count(distinct ${tenantDocument.id})::int`,
      })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .leftJoin(tenantFamilyMember, eq(tenant.id, tenantFamilyMember.tenantId))
      .leftJoin(rentPayment, eq(tenant.id, rentPayment.tenantId))
      .leftJoin(securityDeposit, eq(tenant.id, securityDeposit.tenantId))
      .leftJoin(tenantDocument, eq(tenant.id, tenantDocument.tenantId))
      .where(and(...conditions))
      .groupBy(tenant.id, property.id)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(tenant.createdAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(and(...conditions));

    const totalTenants = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalTenants / limit);

    sendSuccessResponse(response, 200, 'Inactive tenants retrieved successfully', {
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
        isActive: false,
      },
    });
  } catch (error) {
    logError(error, 'SEARCH_INACTIVE_TENANTS');
    sendErrorResponse(response, 500, 'Failed to search inactive tenants.');
  }
};

export default searchInactiveTenants;
