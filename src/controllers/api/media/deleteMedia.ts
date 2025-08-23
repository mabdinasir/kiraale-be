import db from '@db/index';
import { media } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { deleteMediaSchema } from '@schemas/media.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteMedia: RequestHandler = async (request, response) => {
  try {
    const { id } = deleteMediaSchema.parse(request.params);

    // Check if media exists
    const [existingMedia] = await db.select().from(media).where(eq(media.id, id));

    if (!existingMedia) {
      sendErrorResponse(response, 404, 'Media not found');
      return;
    }

    // Permission checks are now handled by middleware

    // Hard delete media (since it's just a file reference)
    await db.delete(media).where(eq(media.id, id));

    response.status(200).json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_MEDIA');
    sendErrorResponse(response, 500, 'Failed to delete media.');
  }
};

export default deleteMedia;
