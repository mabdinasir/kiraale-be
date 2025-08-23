import db from '@db/index';
import { media } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { getMediaByIdSchema } from '@schemas/media.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMedia: RequestHandler = async (request, response) => {
  try {
    const { id } = getMediaByIdSchema.parse(request.params);

    const [existingMedia] = await db.select().from(media).where(eq(media.id, id));

    if (!existingMedia) {
      response.status(404).json({
        success: false,
        message: 'Media not found',
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: {
        media: existingMedia,
      },
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
