import db, {
  property,
  rentPayment,
  securityDeposit,
  tenant,
  tenantDocument,
  tenantFamilyMember,
} from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getMyTenantsSchema } from '@schemas';
import { and, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMyTenants: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const queryParams = getMyTenantsSchema.parse(request.query);

    // Build query conditions
    const conditions = [eq(property.userId, requestingUserId)];

    if (queryParams.isActive !== undefined) {
      conditions.push(eq(tenant.isActive, queryParams.isActive));
    }

    // Pagination
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const offset = (page - 1) * limit;

    // Get all tenants across user's properties with counts
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
      .offset(offset)
      .orderBy(tenant.createdAt);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(and(...conditions));

    const totalCount = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    sendSuccessResponse(response, 200, 'Your tenants retrieved successfully', {
      tenants,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_MY_TENANTS');
    sendErrorResponse(response, 500, `Failed to retrieve tenants: ${(error as Error).message}`);
  }
};

export default getMyTenants;
