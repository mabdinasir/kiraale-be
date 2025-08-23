import db from '@db/index';
import { media, property } from '@db/schemas';
import { adminPermissions } from '@lib/permissions';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { createMediaSchema } from '@schemas/media.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createMedia: RequestHandler = async (request, response) => {
  try {
    const mediaData = createMediaSchema.parse(request.body);

    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    // Check if property exists and user has permission to add media
    const [existingProperty] = await db
      .select()
      .from(property)
      .where(eq(property.id, mediaData.propertyId));

    if (!existingProperty) {
      response.status(404).json({
        success: false,
        message: 'Property not found',
      });
      return;
    }

    // Check if user can add media to this property (owner or admin)
    const canAddMedia =
      existingProperty.userId === requestingUserId ||
      adminPermissions.canAccess(requestingUserRole);

    if (!canAddMedia) {
      sendErrorResponse(
        response,
        403,
        'Access denied. You can only add media to your own properties.',
      );
      return;
    }

    // If setting as primary, unset other primary media for this property
    if (mediaData.isPrimary) {
      await db
        .update(media)
        .set({ isPrimary: false })
        .where(eq(media.propertyId, mediaData.propertyId));
    }

    const [createdMedia] = await db
      .insert(media)
      .values({
        ...mediaData,
        uploadedAt: new Date(),
      })
      .returning();

    response.status(201).json({
      success: true,
      message: 'Media created successfully',
      data: {
        media: createdMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_MEDIA');
    response.status(500).json({
      success: false,
      message: `Internal error occurred: ${(error as Error).message}`,
    });
  }
};

export default createMedia;
