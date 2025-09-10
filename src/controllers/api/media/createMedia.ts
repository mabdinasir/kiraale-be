import db from '@db/index';
import { media, property } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { createMediaSchema } from '@schemas/media.schema';
import { eq, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createMedia: RequestHandler = async (request, response) => {
  try {
    const mediaData = createMediaSchema.parse(request.body);

    // Check if property exists
    const [existingProperty] = await db
      .select()
      .from(property)
      .where(eq(property.id, mediaData.propertyId));

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Permission checks are now handled by middleware

    // Check for duplicate URL
    const [existingMedia] = await db
      .select()
      .from(media)
      .where(eq(media.url, mediaData.url))
      .limit(1);

    if (existingMedia) {
      sendErrorResponse(response, 409, 'Media with this URL already exists');
      return;
    }

    // Handle displayOrder - if not provided, set to next available
    if (!mediaData.displayOrder) {
      const [maxOrder] = await db
        .select({ max: sql<number>`COALESCE(MAX(display_order), 0)` })
        .from(media)
        .where(eq(media.propertyId, mediaData.propertyId));

      mediaData.displayOrder = (maxOrder?.max || 0) + 1;
    }

    // If setting as primary, unset other primary media for this property
    if (mediaData.isPrimary) {
      await db
        .update(media)
        .set({ isPrimary: false })
        .where(eq(media.propertyId, mediaData.propertyId));
    }

    const [createdMedia] = await db
      .insert(media)
      .values({
        ...mediaData,
        uploadedAt: new Date(),
      })
      .returning();

    sendSuccessResponse(response, 201, 'Media created successfully', {
      media: createdMedia,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_MEDIA');
    sendErrorResponse(response, 500, `Internal error occurred: ${(error as Error).message}`);
  }
};

export default createMedia;
