import db, { media } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { getMediaByIdSchema, updateMediaSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateMedia: RequestHandler = async (request, response) => {
  try {
    const { id } = getMediaByIdSchema.parse(request.params);
    const updateData = updateMediaSchema.parse(request.body);

    // Check if media exists
    const [existingMedia] = await db.select().from(media).where(eq(media.id, id));

    if (!existingMedia) {
      sendErrorResponse(response, 404, 'Media not found');
      return;
    }

    // Permission checks are now handled by middleware

    // If setting as primary, unset other primary media for this property
    if (updateData.isPrimary) {
      await db
        .update(media)
        .set({ isPrimary: false })
        .where(eq(media.propertyId, existingMedia.propertyId));
    }

    // Update media
    const [updatedMedia] = await db
      .update(media)
      .set(updateData)
      .where(eq(media.id, id))
      .returning();

    response.status(200).json({
      success: true,
      message: 'Media updated successfully',
      data: {
        media: updatedMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_MEDIA');
    sendErrorResponse(response, 500, 'Failed to update media.');
  }
};

export default updateMedia;
