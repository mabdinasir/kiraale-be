import db from '@db/index';
import { favorite, property, user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { getMyFavoritesSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMyFavorites: RequestHandler = async (request, response) => {
  try {
    const userId = request.user?.id;

    if (!userId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { page, limit } = getMyFavoritesSchema.parse(request.query);

    const offset = (page - 1) * limit;

    // Get user's favorite properties with property and owner details
    const myFavorites = await db
      .select({
        favoriteId: favorite.id,
        favoritedAt: favorite.createdAt,
        property: {
          id: property.id,
          title: property.title,
          description: property.description,
          propertyType: property.propertyType,
          listingType: property.listingType,
          address: property.address,
          country: property.country,
          price: property.price,
          priceType: property.priceType,
          status: property.status,
          createdAt: property.createdAt,
        },
        owner: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      })
      .from(favorite)
      .innerJoin(property, eq(favorite.propertyId, property.id))
      .innerJoin(user, eq(property.userId, user.id))
      .where(eq(favorite.userId, userId))
      .orderBy(favorite.createdAt)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: favorite.id })
      .from(favorite)
      .where(eq(favorite.userId, userId));

    const totalFavorites = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalFavorites / limit);

    sendSuccessResponse(response, 200, 'Your favorites retrieved successfully', {
      favorites: myFavorites,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalFavorites,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_MY_FAVORITES');
    sendErrorResponse(response, 500, 'Failed to retrieve your favorites.');
  }
};

export default getMyFavorites;
