import db from '@db/index';
import { media, property, user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { getRejectedPropertiesSchema } from '@schemas';
import { eq, inArray } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getRejectedProperties: RequestHandler = async (request, response) => {
  try {
    const { page, limit } = getRejectedPropertiesSchema.parse(request.query);

    const offset = (page - 1) * limit;

    // Get rejected properties with owner details
    const rejectedProperties = await db
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
        reviewedBy: property.reviewedBy,
        rejectionReason: property.rejectionReason,
        // User fields (summary for admin display)
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
    const allMedia =
      propertyIds.length > 0
        ? await db
            .select()
            .from(media)
            .where(inArray(media.propertyId, propertyIds))
            .orderBy(media.displayOrder, media.uploadedAt)
        : [];

    // Group media by property ID
    const mediaByPropertyId = allMedia.reduce<Record<string, typeof allMedia>>((acc, mediaItem) => {
      if (!acc[mediaItem.propertyId]) {
        acc[mediaItem.propertyId] = [];
      }
      acc[mediaItem.propertyId].push(mediaItem);
      return acc;
    }, {});

    // Add media to each property
    const propertiesWithMedia = rejectedProperties.map((propertyItem) => ({
      ...propertyItem,
      media: mediaByPropertyId[propertyItem.id] || [],
    }));

    sendSuccessResponse(response, 200, 'Rejected properties retrieved successfully', {
      properties: propertiesWithMedia,
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

    logError(error, 'GET_REJECTED_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to retrieve rejected properties.');
  }
};

export default getRejectedProperties;
