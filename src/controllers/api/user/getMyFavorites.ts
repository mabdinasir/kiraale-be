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

    const { page = 1, limit = 10 } = getMyFavoritesSchema.parse(request.query);

    const offset = (page - 1) * limit;

    // Get user's favorite properties with property and owner details
    const myFavoritesRaw = await db
      .select()
      .from(favorite)
      .innerJoin(property, eq(favorite.propertyId, property.id))
      .innerJoin(user, eq(property.userId, user.id))
      .where(eq(favorite.userId, userId))
      .orderBy(favorite.createdAt)
      .limit(limit)
      .offset(offset);

    // Transform the data to match frontend expectations
    const myFavorites = myFavoritesRaw.map((row) => ({
      favoriteId: row.favorite.id,
      favoritedAt: row.favorite.createdAt,
      property: {
        id: row.property.id,
        title: row.property.title,
        description: row.property.description,
        propertyType: row.property.propertyType,
        listingType: row.property.listingType,
        bedrooms: row.property.bedrooms,
        bathrooms: row.property.bathrooms,
        parkingSpaces: row.property.parkingSpaces,
        landSize: row.property.landSize,
        floorArea: row.property.floorArea,
        hasAirConditioning: row.property.hasAirConditioning,
        address: row.property.address,
        country: row.property.country,
        price: row.property.price,
        priceType: row.property.priceType,
        rentFrequency: row.property.rentFrequency,
        status: row.property.status,
        availableFrom: row.property.availableFrom,
        createdAt: row.property.createdAt,
        updatedAt: row.property.updatedAt,
      },
      owner: {
        id: row.user.id,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
      },
    }));

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
