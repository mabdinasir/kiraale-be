/* eslint-disable @typescript-eslint/naming-convention */
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import db, { media, property } from '@db';
import { handleValidationError, logError, minPropertyMediaFiles, sendErrorResponse } from '@lib';
import { deleteMediaUploadSchema } from '@schemas';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteMediaUpload: RequestHandler = async (request, response) => {
  try {
    // Initialize S3 client for profile pictures
    if (
      !process.env.AWS_BUCKET_REGION ||
      !process.env.PROPERTIES_ACCESS_KEY_ID ||
      !process.env.PROPERTIES_SECRET_ACCESS_KEY ||
      !process.env.PROPERTIES_BUCKET_NAME
    ) {
      sendErrorResponse(response, 500, 'AWS configuration is incomplete');
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

    // Check if property exists
    const [existingProperty] = await db.select().from(property).where(eq(property.id, propertyId));

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Permission checks are now handled by middleware

    // Get media to delete
    const mediaToDelete = await db
      .select()
      .from(media)
      .where(and(inArray(media.id, mediaIds), eq(media.propertyId, propertyId)));

    if (mediaToDelete.length !== mediaIds.length) {
      sendErrorResponse(response, 400, 'Some media IDs do not belong to this property');
      return;
    }

    // Check current total media count for this property
    const [totalMediaCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(media)
      .where(eq(media.propertyId, propertyId));

    const currentTotal = totalMediaCount?.count ?? 0;
    const remainingAfterDelete = currentTotal - mediaToDelete.length;

    // Prevent deletion if it would result in fewer than minimum required images
    if (remainingAfterDelete < minPropertyMediaFiles) {
      sendErrorResponse(
        response,
        400,
        `Cannot delete ${mediaToDelete.length} media items. Properties must have at least ${minPropertyMediaFiles} images. This would leave ${remainingAfterDelete} images.`,
      );
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
