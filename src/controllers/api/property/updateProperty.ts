import db from '@db/index';
import { media, property } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { getPropertyByIdSchema, updatePropertySchema } from '@schemas/property.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = getPropertyByIdSchema.parse(request.params);
    const updateData = updatePropertySchema.parse(request.body);

    // Check if property exists
    const [existingProperty] = await db.select().from(property).where(eq(property.id, id));

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Check ownership - only owner or admin can update
    const userId = request.user?.id;
    const userRole = request.user?.role;

    if (userRole !== 'ADMIN' && existingProperty.userId !== userId) {
      sendErrorResponse(response, 403, 'Not authorized to update this property');
      return;
    }
    // Prepare update data - if property was rejected, set it back to pending for review
    // Keep the review history for admin reference
    const statusUpdate =
      existingProperty.status === 'REJECTED'
        ? {
            status: 'PENDING' as const,
          }
        : {};

    // Update property
    const [updatedProperty] = await db
      .update(property)
      .set({
        ...updateData,
        ...statusUpdate,
        price: updateData.price ? updateData.price.toString() : undefined,
        landSize: updateData.landSize,
        floorArea: updateData.floorArea,
        updatedAt: new Date(),
      })
      .where(eq(property.id, id))
      .returning();

    // Get media for the updated property
    const propertyMedia = await db
      .select()
      .from(media)
      .where(eq(media.propertyId, id))
      .orderBy(media.displayOrder, media.uploadedAt);

    sendSuccessResponse(response, 200, 'Property updated successfully', {
      property: {
        ...updatedProperty,
        media: propertyMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_PROPERTY');
    sendErrorResponse(response, 500, 'Failed to update property.');
  }
};

export default updateProperty;
