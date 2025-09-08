import db from '@db/index';
import { property, user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils';
import { getPropertyByIdSchema } from '@schemas/property.schema';
import { and, eq, ne, or } from 'drizzle-orm';
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
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        // User fields (summary for public display)
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
          // Show property if: NOT pending OR owned by current user
          userId
            ? or(ne(property.status, 'PENDING'), eq(property.userId, userId))
            : ne(property.status, 'PENDING'),
        ),
      )
      .limit(1);

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    sendSuccessResponse(response, 200, 'Property retrieved successfully', {
      property: existingProperty,
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
