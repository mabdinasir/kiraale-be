import db from '@db/index';
import { property } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils';
import { getPropertyByIdSchema } from '@schemas/property.schema';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = getPropertyByIdSchema.parse(request.params);

    const [existingProperty] = await db
      .select()
      .from(property)
      .where(and(eq(property.id, id), eq(property.status, 'APPROVED')))
      .limit(1);

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    sendSuccessResponse(response, 200, 'Property retrieved successfully', {
      property: existingProperty,
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
