import db, { property, user } from '@db';
import {
  getMediaForProperties,
  getOwnerPropertyWithActiveUserFilters,
  getPublicPropertyWithActiveUserFilters,
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
import { getPropertyByIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = getPropertyByIdSchema.parse(request.params);

    // Get user ID from request (if authenticated)
    const userId = request.user?.id;

    const [existingProperty] = await db
      .select({
        // Property fields
        id: property.id,
        userId: property.userId,
        agencyId: property.agencyId,
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
      .where(
        and(
          eq(property.id, id),
          ...(userId
            ? getOwnerPropertyWithActiveUserFilters(userId)
            : getPublicPropertyWithActiveUserFilters()),
        ),
      )
      .limit(1);

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Get media for the property
    const mediaByPropertyId = await getMediaForProperties([id]);
    const propertyMedia = mediaByPropertyId[id] || [];

    sendSuccessResponse(response, 200, 'Property retrieved successfully', {
      property: {
        ...existingProperty,
        media: propertyMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_PROPERTY');
    sendErrorResponse(response, 500, 'Failed to retrieve property information.');
  }
};

export default getProperty;
