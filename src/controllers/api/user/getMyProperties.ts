import db, { property, user } from '@db';
import {
  addMediaToProperties,
  getMediaForProperties,
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
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

    const { page = 1, limit = 50, status } = getMyPropertiesSchema.parse(request.query);

    // Build filters
    const filters = [eq(property.userId, userId), isNull(property.deletedAt)];

    if (status) {
      filters.push(eq(property.status, status));
    }

    const offset = (page - 1) * limit;

    // Get user's properties with user and reviewer info
    const myProperties = await db
      .select({
        // Property fields
        id: property.id,
        userId: property.userId,
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parkingSpaces: property.parkingSpaces,
        landSize: property.landSize,
        floorArea: property.floorArea,
        hasAirConditioning: property.hasAirConditioning,
        address: property.address,
        country: property.country,
        price: property.price,
        priceType: property.priceType,
        rentFrequency: property.rentFrequency,
        status: property.status,
        availableFrom: property.availableFrom,
        rejectionReason: property.rejectionReason,
        searchVector: property.searchVector,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        deletedAt: property.deletedAt,
        // User fields (property owner)
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          profilePicture: user.profilePicture,
          agentNumber: user.agentNumber,
        },
      })
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(and(...filters))
      .orderBy(property.createdAt)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: property.id })
      .from(property)
      .where(and(...filters));

    const totalProperties = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalProperties / limit);

    // Get media for all properties
    const propertyIds = myProperties.map((propertyItem) => propertyItem.id);
    const mediaByPropertyId = await getMediaForProperties(propertyIds);

    // Add media to each property
    const propertiesWithMedia = addMediaToProperties(myProperties, mediaByPropertyId);

    sendSuccessResponse(response, 200, 'Your properties retrieved successfully', {
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

    logError(error, 'GET_MY_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to retrieve your properties.');
  }
};

export default getMyProperties;
