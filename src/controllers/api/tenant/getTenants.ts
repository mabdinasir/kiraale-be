import db, { property, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getTenantsSchema, propertyIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getTenants: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: propertyId } = propertyIdSchema.parse(request.params);
    const queryParams = getTenantsSchema.parse(request.query);

    // Verify property exists and belongs to the user
    const [propertyExists] = await db.select().from(property).where(eq(property.id, propertyId));

    if (!propertyExists) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    if (propertyExists.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only view tenants for your own properties');
      return;
    }

    // Build query conditions
    const conditions = [eq(tenant.propertyId, propertyId)];

    if (queryParams.isActive !== undefined) {
      conditions.push(eq(tenant.isActive, queryParams.isActive));
    }

    // Pagination
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const offset = (page - 1) * limit;

    // Get tenants
    const tenants = await db
      .select()
      .from(tenant)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(tenant.createdAt);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: tenant.id })
      .from(tenant)
      .where(and(...conditions));

    const totalCount = Number(count) || 0;
    const totalPages = Math.ceil(totalCount / limit);

    sendSuccessResponse(response, 200, 'Tenants retrieved successfully', {
      tenants,
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

    logError(error, 'GET_TENANTS');
    sendErrorResponse(response, 500, `Failed to retrieve tenants: ${(error as Error).message}`);
  }
};

export default getTenants;
