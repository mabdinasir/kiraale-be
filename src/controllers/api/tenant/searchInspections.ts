import db, { property, propertyInspection, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchInspectionsSchema } from '@schemas';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const searchInspections: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const queryValidation = searchInspectionsSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 20, search } = queryValidation.data;

    // Build query conditions - only show inspections for user's properties
    const conditions = [
      eq(property.userId, requestingUserId),
      eq(propertyInspection.isDeleted, false),
    ];

    if (search) {
      const searchCondition = or(
        ilike(propertyInspection.notes, `%${search}%`),
        ilike(propertyInspection.inspectedBy, `%${search}%`),
        ilike(propertyInspection.inspectionDate, `%${search}%`),
        ilike(propertyInspection.inspectionType, `%${search}%`),

        ilike(property.title, `%${search}%`),
        ilike(property.address, `%${search}%`),
        ilike(property.propertyType, `%${search}%`),
        ilike(property.country, `%${search}%`),
        ilike(property.description, `%${search}%`),
        ilike(property.status, `%${search}%`),
        ilike(property.price, `%${search}%`),

        ilike(tenant.firstName, `%${search}%`),
        ilike(tenant.lastName, `%${search}%`),
        ilike(tenant.email, `%${search}%`),
        ilike(tenant.mobile, `%${search}%`),
        ilike(tenant.passportNumber, `%${search}%`),
        ilike(tenant.nationalId, `%${search}%`),
        ilike(tenant.rentAmount, `%${search}%`),
        ilike(tenant.emergencyContactName, `%${search}%`),
        ilike(tenant.emergencyContactPhone, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Get inspections with pagination
    const inspections = await db
      .select({
        inspection: propertyInspection,
        property: {
          id: property.id,
          title: property.title,
          address: property.address,
          propertyType: property.propertyType,
        },
        tenant: {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
          mobile: tenant.mobile,
        },
      })
      .from(propertyInspection)
      .innerJoin(property, eq(propertyInspection.propertyId, property.id))
      .leftJoin(tenant, eq(propertyInspection.tenantId, tenant.id))
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(propertyInspection.inspectionDate);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(propertyInspection)
      .innerJoin(property, eq(propertyInspection.propertyId, property.id))
      .leftJoin(tenant, eq(propertyInspection.tenantId, tenant.id))
      .where(and(...conditions));

    const totalInspections = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalInspections / limit);

    sendSuccessResponse(response, 200, 'Inspections retrieved successfully', {
      inspections,
      pagination: {
        page,
        limit,
        total: totalInspections,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
      },
    });
  } catch (error) {
    logError(error, 'SEARCH_INSPECTIONS');
    sendErrorResponse(response, 500, 'Failed to search inspections.');
  }
};

export default searchInspections;
