import db, { media } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getMediaByIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMedia: RequestHandler = async (request, response) => {
  try {
    const { id } = getMediaByIdSchema.parse(request.params);

    const [existingMedia] = await db.select().from(media).where(eq(media.id, id));

    if (!existingMedia) {
      sendErrorResponse(response, 404, 'Media not found');
      return;
    }

    sendSuccessResponse(response, 200, 'Media retrieved successfully', {
      media: existingMedia,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_MEDIA');
    sendErrorResponse(response, 500, 'Failed to retrieve media information.');
  }
};

export default getMedia;
