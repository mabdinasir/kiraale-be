import db from '@db/index';
import { property } from '@db/schemas';
import { adminPermissions } from '@lib/permissions';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { deletePropertySchema } from '@schemas/property.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = deletePropertySchema.parse(request.params);

    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    // Check if property exists
    const [existingProperty] = await db.select().from(property).where(eq(property.id, id));

    if (!existingProperty) {
      response.status(404).json({
        success: false,
        message: 'Property not found',
      });
      return;
    }

    // Check if user can delete this property (owner or admin)
    const canDelete =
      existingProperty.userId === requestingUserId ||
      adminPermissions.canAccess(requestingUserRole);

    if (!canDelete) {
      sendErrorResponse(response, 403, 'Access denied. You can only delete your own properties.');
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
