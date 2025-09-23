/* eslint-disable @typescript-eslint/naming-convention */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import db, { property, tenant, tenantDocument } from '@db';
import {
  computeSHA256,
  handleValidationError,
  logError,
  maxTenantDocumentFiles,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
import { tenantDocumentFileUploadSchema, tenantIdSchema } from '@schemas';
import { and, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';

const upload = multer({ storage: multer.memoryStorage() });

const uploadTenantDocument: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const files = request.files as Express.Multer.File[];
    const { documentType, expiryDate } = request.body;

    if (!files || files.length === 0) {
      sendErrorResponse(response, 400, 'At least 1 file must be uploaded');
      return;
    }

    if (files.length > 1) {
      sendErrorResponse(response, 400, 'Only 1 document can be uploaded at a time');
      return;
    }

    if (!documentType) {
      sendErrorResponse(response, 400, 'Document type is required');
      return;
    }

    // Get tenant with property info to verify ownership
    const [tenantData] = await db
      .select({
        tenant,
        property,
      })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(tenant.id, tenantId));

    if (!tenantData) {
      sendErrorResponse(response, 404, 'Tenant not found');
      return;
    }

    if (tenantData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only upload documents for your own properties');
      return;
    }

    // Check existing document count
    const [existingDocumentCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenantDocument)
      .where(eq(tenantDocument.tenantId, tenantId));

    const currentCount = existingDocumentCount?.count ?? 0;

    if (currentCount >= maxTenantDocumentFiles) {
      sendErrorResponse(
        response,
        400,
        `Cannot upload more documents. Tenant already has ${currentCount} documents. Maximum allowed is ${maxTenantDocumentFiles}.`,
      );
      return;
    }

    // Initialize S3 client
    if (
      !process.env.AWS_BUCKET_REGION ||
      !process.env.TENANT_DOCUMENTS_ACCESS_KEY_ID ||
      !process.env.TENANT_DOCUMENTS_SECRET_ACCESS_KEY ||
      !process.env.TENANT_DOCUMENTS_BUCKET_NAME
    ) {
      sendErrorResponse(response, 500, 'AWS configuration for tenant documents is incomplete');
      return;
    }

    const s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.TENANT_DOCUMENTS_ACCESS_KEY_ID,
        secretAccessKey: process.env.TENANT_DOCUMENTS_SECRET_ACCESS_KEY,
      },
    });

    const [file] = files;
    const checksum = await computeSHA256(file);

    // Parse expiry date if provided
    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : undefined;

    // Validate file
    const validatedData = tenantDocumentFileUploadSchema.parse({
      fileType: file.mimetype,
      fileSize: file.size,
      checksum,
      tenantId,
      documentType,
      expiryDate: parsedExpiryDate,
    });

    // Check for duplicate document type (only one of each type allowed)
    const [existingDocument] = await db
      .select()
      .from(tenantDocument)
      .where(
        and(
          eq(tenantDocument.tenantId, tenantId),
          eq(tenantDocument.documentType, documentType),
          eq(tenantDocument.isActive, true),
        ),
      );

    if (existingDocument) {
      sendErrorResponse(
        response,
        400,
        `A ${documentType.toLowerCase().replace('_', ' ')} document already exists for this tenant. Delete the existing one first.`,
      );
      return;
    }

    const fileName = `${validatedData.checksum}-${Date.now()}-${documentType}`;

    // Create S3 upload command
    const putCommand = new PutObjectCommand({
      Bucket: process.env.TENANT_DOCUMENTS_BUCKET_NAME,
      Key: fileName,
      ContentType: file.mimetype,
      ContentLength: file.size,
      Metadata: {
        checksum: validatedData.checksum,
        userId: requestingUserId,
        tenantId,
        documentType,
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
      logError(`S3 upload failed for document ${file.originalname}`);
      sendErrorResponse(response, 500, 'Failed to upload document to storage');
      return;
    }

    const [documentUrl] = signedUrl.split('?');

    // Save to database
    const [createdDocument] = await db
      .insert(tenantDocument)
      .values({
        tenantId,
        documentType: validatedData.documentType,
        url: documentUrl,
        fileName: file.originalname || fileName,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: requestingUserId,
        expiryDate: validatedData.expiryDate,
        isActive: true,
        uploadedAt: new Date(),
      })
      .returning();

    sendSuccessResponse(response, 201, 'Document uploaded successfully', {
      document: createdDocument,
      uploadedUrl: documentUrl,
      totalDocumentCount: currentCount + 1,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPLOAD_TENANT_DOCUMENT');
    sendErrorResponse(response, 500, `Document upload failed: ${(error as Error).message}`);
  }
};

export default [upload.array('files', 1), uploadTenantDocument];
