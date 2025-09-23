import db, { property, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { endTenantLeaseSchema, tenantIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const endTenantLease: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const validatedData = endTenantLeaseSchema.parse(request.body);

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
      sendErrorResponse(response, 403, 'You can only manage tenants for your own properties');
      return;
    }

    if (!tenantData.tenant.isActive) {
      sendErrorResponse(response, 400, 'Tenant is already moved out');
      return;
    }

    // Update tenant to moved out
    const [updatedTenant] = await db
      .update(tenant)
      .set({
        isActive: false,
        leaseEndDate: validatedData.leaseEndDate,
        leaseEndReason: validatedData.leaseEndReason,
        leaseEndNotes: validatedData.leaseEndNotes,
        updatedAt: new Date(),
      })
      .where(eq(tenant.id, tenantId))
      .returning();

    sendSuccessResponse(response, 200, 'Tenant moved out successfully', {
      tenant: updatedTenant,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'MOVE_OUT_TENANT');
    sendErrorResponse(response, 500, `Move out failed: ${(error as Error).message}`);
  }
};

export default endTenantLease;
