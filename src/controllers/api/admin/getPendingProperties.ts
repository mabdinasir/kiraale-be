import db from '@db/index';
import { property, user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { getPendingPropertiesSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getPendingProperties: RequestHandler = async (request, response) => {
  try {
    const { page, limit } = getPendingPropertiesSchema.parse(request.query);

    const offset = (page - 1) * limit;

    // Get pending properties with owner details
    const pendingProperties = await db
      .select()
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(eq(property.status, 'PENDING'))
      .orderBy(property.createdAt) // Oldest first for FIFO processing
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: property.id })
      .from(property)
      .where(eq(property.status, 'PENDING'));

    const totalProperties = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalProperties / limit);

    sendSuccessResponse(response, 200, 'Pending properties retrieved successfully', {
      properties: pendingProperties,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProperties,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_PENDING_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to retrieve pending properties.');
  }
};

export default getPendingProperties;
