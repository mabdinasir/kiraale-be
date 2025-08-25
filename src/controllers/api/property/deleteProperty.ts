import db from '@db/index';
import { property } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
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

    // Check ownership - only owner or admin can delete
    const userId = request.user?.id;
    const userRole = request.user?.role;

    if (userRole !== 'ADMIN' && existingProperty.userId !== userId) {
      sendErrorResponse(response, 403, 'Not authorized to delete this property');
      return;
    }

    // Soft delete - set deletedAt timestamp
    await db
      .update(property)
      .set({
        deletedAt: new Date(),
        status: 'WITHDRAWN',
        updatedAt: new Date(),
      })
      .where(eq(property.id, id));

    sendSuccessResponse(response, 200, 'Property deleted successfully', {});
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
