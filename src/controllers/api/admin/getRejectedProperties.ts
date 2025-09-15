import db, { property, user } from '@db';
import {
  addMediaToProperties,
  getMediaForProperties,
  getPropertyWithUserSelection,
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
import { getRejectedPropertiesSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getRejectedProperties: RequestHandler = async (request, response) => {
  try {
    const { page, limit } = getRejectedPropertiesSchema.parse(request.query);

    const offset = (page - 1) * limit;

    // Get rejected properties with owner details
    const rejectedProperties = await db
      .select(getPropertyWithUserSelection())
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(eq(property.status, 'REJECTED'))
      .orderBy(property.updatedAt) // Most recently rejected first
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: property.id })
      .from(property)
      .where(eq(property.status, 'REJECTED'));

    const totalProperties = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalProperties / limit);

    // Get media for all properties
    const propertyIds = rejectedProperties.map((propertyItem) => propertyItem.id);
    const mediaByPropertyId = await getMediaForProperties(propertyIds);

    // Add media to each property
    const propertiesWithMedia = addMediaToProperties(rejectedProperties, mediaByPropertyId);

    sendSuccessResponse(response, 200, 'Rejected properties retrieved successfully', {
      properties: propertiesWithMedia,
      pagination: {
        page,
        limit,
        total: totalProperties,
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

    logError(error, 'GET_REJECTED_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to retrieve rejected properties.');
  }
};

export default getRejectedProperties;
