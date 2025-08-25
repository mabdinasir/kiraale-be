/* eslint-disable @typescript-eslint/naming-convention */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import db from '@db/index';
import { media, property } from '@db/schemas';
import { maxPropertyMediaFiles, minFirstUploadFiles } from '@lib/config/fileUpload';
import computeSHA256 from '@lib/utils/crypto/computeSHA256';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { propertyMediaUploadSchema } from '@schemas/media.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';

const upload = multer({ storage: multer.memoryStorage() });

const uploadMedia: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const files = request.files as Express.Multer.File[];
    const { propertyId } = request.body;

    if (!files || files.length === 0) {
      sendErrorResponse(response, 400, 'At least 1 file must be uploaded');
      return;
    }

    if (!propertyId) {
      sendErrorResponse(response, 400, 'Property ID is required');
      return;
    }

    // Check if property exists
    const [existingProperty] = await db.select().from(property).where(eq(property.id, propertyId));

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Permission checks are now handled by middleware

    // Check existing media count
    const existingMediaCount = await db
      .select({ count: media.id })
      .from(media)
      .where(eq(media.propertyId, propertyId));

    const currentCount = Number(existingMediaCount[0]?.count || 0);
    const isFirstUpload = currentCount === 0;

    if (isFirstUpload && files.length < minFirstUploadFiles) {
      sendErrorResponse(
        response,
        400,
        `First-time uploads must include at least ${minFirstUploadFiles} images`,
      );
      return;
    }

    // Initialize S3 client
    if (
      !process.env.AWS_BUCKET_REGION ||
      !process.env.PROPERTIES_ACCESS_KEY_ID ||
      !process.env.PROPERTIES_SECRET_ACCESS_KEY
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

    const uploadedUrls: string[] = [];

    // Process uploads
    const uploadPromises = files.map(async (file, index) => {
      const checksum = await computeSHA256(file);

      // Validate each file
      const validatedData = propertyMediaUploadSchema.parse({
        fileType: file.mimetype,
        fileSize: file.size,
        checksum,
        propertyId,
      });

      const fileName = `${validatedData.checksum}-${Date.now()}-${index}`;

      // Create S3 upload command
      if (!process.env.PROPERTIES_BUCKET_NAME) {
        logError('Properties bucket name is not configured');
      }

      const putCommand = new PutObjectCommand({
        Bucket: process.env.PROPERTIES_BUCKET_NAME,
        Key: fileName,
        ContentType: file.mimetype,
        ContentLength: file.size,
        Metadata: {
          checksum: validatedData.checksum,
          userId: requestingUserId,
          propertyId,
        },
      });

      // Get signed URL and upload
      const signedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: new Uint8Array(file.buffer),
        headers: { 'Content-Type': file.mimetype },
      });

      if (!uploadResponse.ok) {
        logError(`S3 upload failed for file ${file.originalname}`);
      }

      const [mediaUrl] = signedUrl.split('?');
      uploadedUrls.push(mediaUrl);

      // Determine media type
      const mediaType = file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';

      // Save to database
      const [createdMedia] = await db
        .insert(media)
        .values({
          propertyId,
          type: mediaType,
          url: mediaUrl,
          fileName: file.originalname || fileName,
          fileSize: file.size,
          displayOrder: currentCount + index + 1,
          isPrimary: isFirstUpload && index === 0, // First image of first upload is primary
          uploadedAt: new Date(),
        })
        .returning();

      return createdMedia;
    });

    const createdMediaList = await Promise.all(uploadPromises);

    response.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        media: createdMediaList,
        uploadedUrls,
        isFirstUpload,
        totalMediaCount: currentCount + files.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPLOAD_MEDIA');
    sendErrorResponse(response, 500, `Internal error occurred: ${(error as Error).message}`);
  }
};

export default [upload.array('files', maxPropertyMediaFiles), uploadMedia];
