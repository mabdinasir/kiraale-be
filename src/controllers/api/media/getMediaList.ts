import db, { media } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { queryMediaSchema } from '@schemas';
import { and, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMediaList: RequestHandler = async (request, response) => {
  try {
    const {
      propertyId,
      type,
      isPrimary,
      page = 1,
      limit = 50,
    } = queryMediaSchema.parse(request.query);

    // Build filters
    const filters = [];

    if (propertyId) {
      filters.push(eq(media.propertyId, propertyId));
    }
    if (type) {
      filters.push(eq(media.type, type));
    }
    if (isPrimary !== undefined) {
      filters.push(eq(media.isPrimary, isPrimary));
    }

    const offset = (page - 1) * limit;

    const mediaList = await db
      .select()
      .from(media)
      .where(and(...filters))
      .limit(limit)
      .offset(offset)
      .orderBy(media.displayOrder, media.uploadedAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(media)
      .where(and(...filters));

    const totalMedia = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalMedia / limit);

    sendSuccessResponse(response, 200, 'Media list retrieved successfully', {
      media: mediaList,
      pagination: {
        page,
        limit,
        total: totalMedia,
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

    logError(error, 'GET_MEDIA_LIST');
    sendErrorResponse(response, 500, 'Failed to retrieve media list.');
  }
};

export default getMediaList;
