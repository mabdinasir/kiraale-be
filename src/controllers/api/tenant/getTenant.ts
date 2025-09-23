import db, {
  property,
  rentPayment,
  securityDeposit,
  tenant,
  tenantDocument,
  tenantFamilyMember,
} from '@db';
import { logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { tenantIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getTenant: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);

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
      sendErrorResponse(response, 403, 'You can only view tenants for your own properties');
      return;
    }

    // Get family members for this tenant
    const familyMembers = await db
      .select()
      .from(tenantFamilyMember)
      .where(eq(tenantFamilyMember.tenantId, tenantId));

    // Get payment history for this tenant
    const payments = await db
      .select()
      .from(rentPayment)
      .where(eq(rentPayment.tenantId, tenantId))
      .orderBy(rentPayment.paidDate);

    // Get security deposits for this tenant
    const deposits = await db
      .select()
      .from(securityDeposit)
      .where(eq(securityDeposit.tenantId, tenantId));

    // Get documents for this tenant
    const documents = await db
      .select()
      .from(tenantDocument)
      .where(eq(tenantDocument.tenantId, tenantId))
      .orderBy(tenantDocument.createdAt);

    sendSuccessResponse(response, 200, 'Tenant retrieved successfully', {
      tenant: tenantData.tenant,
      property: {
        id: tenantData.property.id,
        title: tenantData.property.title,
        address: tenantData.property.address,
        propertyType: tenantData.property.propertyType,
      },
      familyMembers,
      payments,
      deposits,
      documents,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendErrorResponse(response, 400, 'Invalid tenant ID format');
      return;
    }

    logError(error, 'GET_TENANT');
    sendErrorResponse(response, 500, `Failed to retrieve tenant: ${(error as Error).message}`);
  }
};

export default getTenant;
