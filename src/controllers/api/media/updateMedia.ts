import db from '@db/index';
import { media, property } from '@db/schemas';
import { adminPermissions } from '@lib/permissions';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { getMediaByIdSchema, updateMediaSchema } from '@schemas/media.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateMedia: RequestHandler = async (request, response) => {
  try {
    const { id } = getMediaByIdSchema.parse(request.params);
    const updateData = updateMediaSchema.parse(request.body);

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

    // Check if user can modify this media (property owner or admin)
    const canModify =
      existingMedia.propertyUserId === requestingUserId ||
      adminPermissions.canAccess(requestingUserRole);

    if (!canModify) {
      sendErrorResponse(
        response,
        403,
        'Access denied. You can only update media for your own properties.',
      );
      return;
    }

    // If setting as primary, unset other primary media for this property
    if (updateData.isPrimary) {
      await db
        .update(media)
        .set({ isPrimary: false })
        .where(eq(media.propertyId, existingMedia.media.propertyId));
    }

    // Update media
    const [updatedMedia] = await db
      .update(media)
      .set(updateData)
      .where(eq(media.id, id))
      .returning();

    response.status(200).json({
      success: true,
      message: 'Media updated successfully',
      data: {
        media: updatedMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_MEDIA');
    sendErrorResponse(response, 500, 'Failed to update media.');
  }
};

export default updateMedia;
