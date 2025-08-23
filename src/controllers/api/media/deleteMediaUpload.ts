/* eslint-disable @typescript-eslint/naming-convention */
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import db from '@db/index';
import { media, property } from '@db/schemas';
import { adminPermissions } from '@lib/permissions';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { deleteMediaUploadSchema } from '@schemas/media.schema';
import { and, eq, inArray } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteMediaUpload: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    // Initialize S3 client for profile pictures
    if (
      !process.env.AWS_BUCKET_REGION ||
      !process.env.PROPERTIES_ACCESS_KEY_ID ||
      !process.env.PROPERTIES_SECRET_ACCESS_KEY ||
      !process.env.PROPERTIES_BUCKET_NAME
    ) {
      response.status(500).json({
        success: false,
        message: 'AWS configuration is incomplete',
      });
      return;
    }

    const s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.PROPERTIES_ACCESS_KEY_ID,
        secretAccessKey: process.env.PROPERTIES_SECRET_ACCESS_KEY,
      },
    });

    const { mediaIds, propertyId } = deleteMediaUploadSchema.parse(request.body);

    // Check if property exists and get ownership info
    const [existingProperty] = await db.select().from(property).where(eq(property.id, propertyId));

    if (!existingProperty) {
      response.status(404).json({
        success: false,
        message: 'Property not found',
      });
      return;
    }

    // Check permissions (owner or admin)
    const canDelete =
      existingProperty.userId === requestingUserId ||
      adminPermissions.canAccess(requestingUserRole);

    if (!canDelete) {
      sendErrorResponse(
        response,
        403,
        'Access denied. You can only delete media from your own properties.',
      );
      return;
    }

    // Get media to delete
    const mediaToDelete = await db
      .select()
      .from(media)
      .where(and(inArray(media.id, mediaIds), eq(media.propertyId, propertyId)));

    if (mediaToDelete.length !== mediaIds.length) {
      response.status(400).json({
        success: false,
        message: 'Some media IDs do not belong to this property',
      });
      return;
    }

    // Delete from S3 and database
    const deletePromises = mediaToDelete.map(async (mediaItem) => {
      // Extract key from URL
      const urlParts = mediaItem.url.split('/');
      const key = urlParts[urlParts.length - 1];

      if (key) {
        // Delete from S3
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.PROPERTIES_BUCKET_NAME,
            Key: key,
          }),
        );
      }

      // Delete from database
      await db.delete(media).where(eq(media.id, mediaItem.id));

      return mediaItem.id;
    });

    const deletedIds = await Promise.all(deletePromises);

    response.status(200).json({
      success: true,
      message: 'Media deleted successfully',
      data: {
        deletedIds,
        deletedCount: deletedIds.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_MEDIA_UPLOAD');
    sendErrorResponse(response, 500, 'Failed to delete media.');
  }
};

export default deleteMediaUpload;
