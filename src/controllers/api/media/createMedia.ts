import db from '@db/index';
import { media, property } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { createMediaSchema } from '@schemas/media.schema';
import { eq } from 'drizzle-orm';
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

    response.status(201).json({
      success: true,
      message: 'Media created successfully',
      data: {
        media: createdMedia,
      },
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
