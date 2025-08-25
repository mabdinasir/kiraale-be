import db from '@db/index';
import { media } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { getMediaByIdSchema } from '@schemas/media.schema';
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
