import db from '@db/index';
import { media, property } from '@db/schemas';
import { adminPermissions } from '@lib/permissions';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { deleteMediaSchema } from '@schemas/media.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteMedia: RequestHandler = async (request, response) => {
  try {
    const { id } = deleteMediaSchema.parse(request.params);

    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    // Check if media exists and get property info
    const [existingMedia] = await db
      .select({
        media,
        propertyUserId: property.userId,
      })
      .from(media)
      .innerJoin(property, eq(media.propertyId, property.id))
      .where(eq(media.id, id));

    if (!existingMedia) {
      response.status(404).json({
        success: false,
        message: 'Media not found',
      });
      return;
    }

    // Check if user can delete this media (property owner or admin)
    const canDelete =
      existingMedia.propertyUserId === requestingUserId ||
      adminPermissions.canAccess(requestingUserRole);

    if (!canDelete) {
      sendErrorResponse(
        response,
        403,
        'Access denied. You can only delete media for your own properties.',
      );
      return;
    }

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
