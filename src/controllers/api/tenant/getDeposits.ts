import db, { property, securityDeposit, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getDepositsSchema, tenantIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getDeposits: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const queryParams = getDepositsSchema.parse(request.query);

    // Get tenant with property info to verify ownership
    const [tenantData] = await db
      .select({
        tenant,
        property,
      })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(tenant.id, tenantId));

    if (!tenantData) {
      sendErrorResponse(response, 404, 'Tenant not found');
      return;
    }

    if (tenantData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only view deposits for your own properties');
      return;
    }

    // Build query conditions
    const conditions = [eq(securityDeposit.tenantId, tenantId)];

    if (queryParams.isRefunded !== undefined) {
      conditions.push(eq(securityDeposit.isRefunded, queryParams.isRefunded));
    }

    // Pagination
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const offset = (page - 1) * limit;

    // Get deposits
    const deposits = await db
      .select()
      .from(securityDeposit)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(securityDeposit.createdAt);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: securityDeposit.id })
      .from(securityDeposit)
      .where(and(...conditions));

    const totalCount = Number(count) || 0;
    const totalPages = Math.ceil(totalCount / limit);

    sendSuccessResponse(response, 200, 'Deposits retrieved successfully', {
      deposits,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_DEPOSITS');
    sendErrorResponse(response, 500, `Failed to retrieve deposits: ${(error as Error).message}`);
  }
};

export default getDeposits;
