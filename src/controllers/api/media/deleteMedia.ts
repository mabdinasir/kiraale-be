/* eslint-disable @typescript-eslint/naming-convention */
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import db, { media } from '@db';
import { handleValidationError, logError, minPropertyMediaFiles, sendErrorResponse } from '@lib';
import { deleteMediaSchema } from '@schemas';
import { eq, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteMedia: RequestHandler = async (request, response) => {
  try {
    // Initialize S3 client
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

    const { id } = deleteMediaSchema.parse(request.params);

    // Check if media exists
    const [existingMedia] = await db.select().from(media).where(eq(media.id, id));

    if (!existingMedia) {
      sendErrorResponse(response, 404, 'Media not found');
      return;
    }

    // Permission checks are now handled by middleware

    // Check current media count for this property
    const [mediaCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(media)
      .where(eq(media.propertyId, existingMedia.propertyId));

    const currentCount = mediaCount?.count ?? 0;

    // Prevent deletion if it would result in fewer than minimum required images
    if (currentCount <= minPropertyMediaFiles) {
      sendErrorResponse(
        response,
        400,
        `Cannot delete media. Properties must have at least ${minPropertyMediaFiles} images.`,
      );
      return;
    }

    // Extract S3 key from URL and delete from S3
    const urlParts = existingMedia.url.split('/');
    const key = urlParts[urlParts.length - 1];

    if (key) {
      try {
        // Delete from S3
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.PROPERTIES_BUCKET_NAME,
            Key: key,
          }),
        );
      } catch (s3Error) {
        // Log S3 error but don't fail the entire operation
        logError(s3Error, 'S3_DELETE_MEDIA');
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await db.delete(media).where(eq(media.id, id));

    response.status(200).json({
      success: true,
      message: 'Media deleted successfully from both database and storage',
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
