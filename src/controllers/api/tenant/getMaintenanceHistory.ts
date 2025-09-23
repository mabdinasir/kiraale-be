import db, { maintenanceRecord, property } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getMaintenanceHistorySchema, propertyIdSchema } from '@schemas';
import { and, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMaintenanceHistory: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: propertyId } = propertyIdSchema.parse(request.params);
    const queryParams = getMaintenanceHistorySchema.parse(request.query);

    // Verify property exists and belongs to the user
    const [propertyExists] = await db.select().from(property).where(eq(property.id, propertyId));

    if (!propertyExists) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    if (propertyExists.userId !== requestingUserId) {
      sendErrorResponse(
        response,
        403,
        'You can only view maintenance history for your own properties',
      );
      return;
    }

    // Build query conditions
    const conditions = [eq(maintenanceRecord.propertyId, propertyId)];

    if (queryParams.isFixed !== undefined) {
      conditions.push(eq(maintenanceRecord.isFixed, queryParams.isFixed));
    }

    // Pagination
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const offset = (page - 1) * limit;

    // Get maintenance history
    const maintenanceHistory = await db
      .select()
      .from(maintenanceRecord)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(maintenanceRecord.reportedDate);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(maintenanceRecord)
      .where(and(...conditions));

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    sendSuccessResponse(response, 200, 'Maintenance history retrieved successfully', {
      maintenanceHistory,
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

    logError(error, 'GET_MAINTENANCE_HISTORY');
    sendErrorResponse(
      response,
      500,
      `Failed to retrieve maintenance history: ${(error as Error).message}`,
    );
  }
};

export default getMaintenanceHistory;
