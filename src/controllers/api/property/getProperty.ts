import db from '@db/index';
import { property } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { getPropertyByIdSchema } from '@schemas/property.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = getPropertyByIdSchema.parse(request.params);

    const [existingProperty] = await db.select().from(property).where(eq(property.id, id));

    if (!existingProperty) {
      response.status(404).json({
        success: false,
        message: 'Property not found',
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: {
        property: existingProperty,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_PROPERTY');
    sendErrorResponse(response, 500, 'Failed to retrieve property information.');
  }
};

export default getProperty;
