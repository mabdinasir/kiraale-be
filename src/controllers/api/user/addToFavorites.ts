import db from '@db/index';
import { favorite, property } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { addToFavoritesSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const addToFavorites: RequestHandler = async (request, response) => {
  try {
    const userId = request.user?.id;

    if (!userId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { propertyId } = addToFavoritesSchema.parse(request.body);

    // Check if property exists and is active
    const [existingProperty] = await db.select().from(property).where(eq(property.id, propertyId));

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    if (existingProperty.status !== 'APPROVED') {
      sendErrorResponse(response, 400, 'Property is not available for favorites');
      return;
    }

    // Check if already favorited
    const [existingFavorite] = await db
      .select()
      .from(favorite)
      .where(and(eq(favorite.userId, userId), eq(favorite.propertyId, propertyId)));

    if (existingFavorite) {
      sendErrorResponse(response, 400, 'Property is already in your favorites');
      return;
    }

    // Add to favorites
    const [newFavorite] = await db
      .insert(favorite)
      .values({
        userId,
        propertyId,
      })
      .returning();

    response.status(201).json({
      success: true,
      message: 'Property added to favorites successfully',
      data: {
        favorite: newFavorite,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADD_TO_FAVORITES');
    sendErrorResponse(response, 500, 'Failed to add property to favorites.');
  }
};

export default addToFavorites;
