import db, { media, property, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getPropertyByIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = getPropertyByIdSchema.parse(request.params);

    const [existingProperty] = await db
      .select({
        // Property fields - including all sensitive admin fields
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
        reviewedAt: property.reviewedAt,
        reviewedBy: property.reviewedBy,
        rejectionReason: property.rejectionReason,
        adminNotes: property.adminNotes,
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
      .where(eq(property.id, id))
      .limit(1);

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Get reviewer details if property has been reviewed
    let reviewer = null;
    if (existingProperty.reviewedBy) {
      const [reviewerData] = await db
        .select({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        })
        .from(user)
        .where(eq(user.id, existingProperty.reviewedBy))
        .limit(1);

      reviewer = reviewerData || null;
    }

    // Get media for the property
    const propertyMedia = await db
      .select()
      .from(media)
      .where(eq(media.propertyId, id))
      .orderBy(media.displayOrder, media.uploadedAt);

    sendSuccessResponse(response, 200, 'Property retrieved successfully', {
      property: {
        ...existingProperty,
        reviewer,
        media: propertyMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADMIN_GET_PROPERTY');
    sendErrorResponse(response, 500, 'Failed to retrieve property information.');
  }
};

export default getProperty;
