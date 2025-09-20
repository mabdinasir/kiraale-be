import db, { property, tenant, tenantDocument, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getTenantDocumentsSchema, tenantIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getTenantDocuments: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const queryParams = getTenantDocumentsSchema.parse(request.query);

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
      sendErrorResponse(response, 403, 'You can only view documents for your own properties');
      return;
    }

    // Build query conditions
    const conditions = [eq(tenantDocument.tenantId, tenantId)];

    if (queryParams.documentType) {
      conditions.push(eq(tenantDocument.documentType, queryParams.documentType));
    }

    if (queryParams.isActive !== undefined) {
      conditions.push(eq(tenantDocument.isActive, queryParams.isActive));
    }

    // Get documents with uploader info
    const documents = await db
      .select({
        document: tenantDocument,
        uploadedBy: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })
      .from(tenantDocument)
      .innerJoin(user, eq(tenantDocument.uploadedBy, user.id))
      .where(and(...conditions))
      .orderBy(tenantDocument.uploadedAt);

    sendSuccessResponse(response, 200, 'Documents retrieved successfully', documents);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_TENANT_DOCUMENTS');
    sendErrorResponse(response, 500, `Failed to retrieve documents: ${(error as Error).message}`);
  }
};

export default getTenantDocuments;
