import db, { favorite } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { removeFromFavoritesParamsSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const removeFromFavorites: RequestHandler = async (request, response) => {
  try {
    const userId = request.user?.id;

    if (!userId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { propertyId } = removeFromFavoritesParamsSchema.parse(request.params);

    // Check if favorite exists
    const [existingFavorite] = await db
      .select()
      .from(favorite)
      .where(and(eq(favorite.userId, userId), eq(favorite.propertyId, propertyId)));

    if (!existingFavorite) {
      sendErrorResponse(response, 404, 'Property not found in your favorites');
      return;
    }

    // Remove from favorites
    await db
      .delete(favorite)
      .where(and(eq(favorite.userId, userId), eq(favorite.propertyId, propertyId)));

    sendSuccessResponse(response, 200, 'Property removed from favorites successfully', {});
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'REMOVE_FROM_FAVORITES');
    sendErrorResponse(response, 500, 'Failed to remove property from favorites.');
  }
};

export default removeFromFavorites;
