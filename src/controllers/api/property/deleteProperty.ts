import db from '@db/index';
import { property } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { deletePropertySchema } from '@schemas/property.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = deletePropertySchema.parse(request.params);

    // Check if property exists
    const [existingProperty] = await db.select().from(property).where(eq(property.id, id));

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Permission checks are now handled by middleware

    // Soft delete - set deletedAt timestamp
    await db
      .update(property)
      .set({
        deletedAt: new Date(),
        status: 'WITHDRAWN',
        updatedAt: new Date(),
      })
      .where(eq(property.id, id));

    response.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_PROPERTY');
    sendErrorResponse(response, 500, 'Failed to delete property.');
  }
};

export default deleteProperty;
