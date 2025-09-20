import db, { property, tenant, tenantDocument } from '@db';
import { logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { documentIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteTenantDocument: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: documentId } = documentIdSchema.parse(request.params);

    // Get document with tenant and property info to verify ownership
    const [documentData] = await db
      .select({
        document: tenantDocument,
        tenant,
        property,
      })
      .from(tenantDocument)
      .innerJoin(tenant, eq(tenantDocument.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(tenantDocument.id, documentId));

    if (!documentData) {
      sendErrorResponse(response, 404, 'Document not found');
      return;
    }

    if (documentData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only delete documents for your own properties');
      return;
    }

    // Soft delete by setting isActive to false
    const [updatedDocument] = await db
      .update(tenantDocument)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(tenantDocument.id, documentId))
      .returning();

    sendSuccessResponse(response, 200, 'Document deleted successfully', updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendErrorResponse(response, 400, 'Invalid document ID format');
      return;
    }

    logError(error, 'DELETE_TENANT_DOCUMENT');
    sendErrorResponse(response, 500, `Failed to delete document: ${(error as Error).message}`);
  }
};

export default deleteTenantDocument;
