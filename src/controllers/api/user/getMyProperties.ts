import db from '@db/index';
import { property, user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { getMyPropertiesSchema } from '@schemas';
import { and, eq, isNull } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMyProperties: RequestHandler = async (request, response) => {
  try {
    const userId = request.user?.id;

    if (!userId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { page = 1, limit = 10, status } = getMyPropertiesSchema.parse(request.query);

    // Build filters
    const filters = [eq(property.userId, userId), isNull(property.deletedAt)];

    if (status) {
      filters.push(eq(property.status, status));
    }

    const offset = (page - 1) * limit;

    // Get user's properties with reviewer info when available
    const myPropertiesRaw = await db
      .select()
      .from(property)
      .leftJoin(user, eq(property.reviewedBy, user.id))
      .where(and(...filters))
      .orderBy(property.createdAt)
      .limit(limit)
      .offset(offset);

    // Transform the data to include reviewer info
    const myProperties = myPropertiesRaw.map((row) => ({
      ...row.property,
      reviewer: row.user
        ? {
            id: row.user.id,
            firstName: row.user.firstName,
            lastName: row.user.lastName,
            email: row.user.email,
          }
        : null,
    }));

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: property.id })
      .from(property)
      .where(and(...filters));

    const totalProperties = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalProperties / limit);

    sendSuccessResponse(response, 200, 'Your properties retrieved successfully', {
      properties: myProperties,
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

    logError(error, 'GET_MY_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to retrieve your properties.');
  }
};

export default getMyProperties;
