/* eslint-disable @typescript-eslint/naming-convention */
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import db from '@db/index';
import { user } from '@db/schemas';
import computeSHA256 from '@lib/utils/crypto/computeSHA256';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { profilePicUploadSchema } from '@schemas/user.schema';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

const uploadProfilePic: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { file } = request;
    if (!file) {
      response.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    // Compute file checksum
    const checksum = await computeSHA256(file);

    // Validate file details using Zod
    const validatedData = profilePicUploadSchema.parse({
      fileType: file.mimetype,
      fileSize: file.size,
      checksum,
    });

    // Initialize S3 client for profile pictures
    if (
      !process.env.AWS_BUCKET_REGION ||
      !process.env.PROFILE_PIC_ACCESS_KEY_ID ||
      !process.env.PROFILE_PIC_SECRET_ACCESS_KEY
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
        accessKeyId: process.env.PROFILE_PIC_ACCESS_KEY_ID,
        secretAccessKey: process.env.PROFILE_PIC_SECRET_ACCESS_KEY,
      },
    });

    // Generate unique filename
    const fileName = `${validatedData.checksum}-${Date.now()}`;

    // Check if the user already has a profile picture and delete it from S3 if exists
    const [existingUser] = await db
      .select({ profilePicture: user.profilePicture })
      .from(user)
      .where(eq(user.id, requestingUserId));

    if (existingUser?.profilePicture) {
      // Delete the previous profile picture from the S3 bucket
      const urlParts = existingUser.profilePicture.split('/');
      const oldKey = urlParts[urlParts.length - 1];

      if (oldKey) {
        if (!process.env.PROFILE_PIC_BUCKET_NAME) {
          response.status(500).json({
            success: false,
            message: 'Profile picture bucket name is not configured',
          });
          return;
        }

        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.PROFILE_PIC_BUCKET_NAME,
          Key: oldKey,
        });

        await s3Client.send(deleteCommand);
      }
    }

    // Create S3 upload command
    if (!process.env.PROFILE_PIC_BUCKET_NAME) {
      response.status(500).json({
        success: false,
        message: 'Profile picture bucket name is not configured',
      });
      return;
    }

    const putCommand = new PutObjectCommand({
      Bucket: process.env.PROFILE_PIC_BUCKET_NAME,
      Key: fileName,
      ContentType: file.mimetype,
      ContentLength: file.size,
      Metadata: {
        checksum: validatedData.checksum,
        userId: requestingUserId,
      },
    });

    // Generate signed URL
    const signedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });

    // Upload to S3
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: new Uint8Array(file.buffer),
      headers: { 'Content-Type': file.mimetype },
    });

    if (!uploadResponse.ok) {
      response.status(500).json({
        success: false,
        message: 'S3 upload failed',
      });
      return;
    }

    // Get permanent URL
    const [mediaUrl] = signedUrl.split('?');

    // Update user profile with new profile picture URL
    const [updatedUser] = await db
      .update(user)
      .set({
        profilePicture: mediaUrl,
        updatedAt: new Date(),
      })
      .where(eq(user.id, requestingUserId))
      .returning({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
      });

    response.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        user: updatedUser,
        profilePicture: mediaUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPLOAD_PROFILE_PIC');
    response.status(500).json({
      success: false,
      message: `Internal error occurred: ${(error as Error).message}`,
    });
  }
};

export default [upload.single('file'), uploadProfilePic];
