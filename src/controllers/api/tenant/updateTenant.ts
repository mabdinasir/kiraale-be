import db, { property, tenant, type Tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { tenantIdSchema, updateTenantSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateTenant: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const validatedData = updateTenantSchema.parse(request.body);

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
      sendErrorResponse(response, 403, 'You can only update tenants for your own properties');
      return;
    }

    // Update tenant
    const updateData: Partial<Tenant> & Pick<Tenant, 'updatedAt'> = {
      updatedAt: new Date(),
    };

    if (validatedData.firstName) {
      updateData.firstName = validatedData.firstName;
    }
    if (validatedData.lastName) {
      updateData.lastName = validatedData.lastName;
    }
    if (validatedData.email) {
      updateData.email = validatedData.email;
    }
    if (validatedData.mobile) {
      updateData.mobile = validatedData.mobile;
    }
    if (validatedData.nationalId !== undefined) {
      updateData.nationalId = validatedData.nationalId;
    }
    if (validatedData.passportNumber !== undefined) {
      updateData.passportNumber = validatedData.passportNumber;
    }
    if (validatedData.emergencyContactName) {
      updateData.emergencyContactName = validatedData.emergencyContactName;
    }
    if (validatedData.emergencyContactPhone) {
      updateData.emergencyContactPhone = validatedData.emergencyContactPhone;
    }
    if (validatedData.leaseType) {
      updateData.leaseType = validatedData.leaseType;
    }
    if (validatedData.leaseFrequency) {
      updateData.leaseFrequency = validatedData.leaseFrequency;
    }
    if (validatedData.rentAmount) {
      updateData.rentAmount = validatedData.rentAmount.toString();
    }
    if (validatedData.leaseStartDate) {
      updateData.leaseStartDate = validatedData.leaseStartDate;
    }
    if (validatedData.leaseEndDate !== undefined) {
      updateData.leaseEndDate = validatedData.leaseEndDate;
    }

    const [updatedTenant] = await db
      .update(tenant)
      .set(updateData)
      .where(eq(tenant.id, tenantId))
      .returning();

    sendSuccessResponse(response, 200, 'Tenant updated successfully', updatedTenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_TENANT');
    sendErrorResponse(response, 500, `Tenant update failed: ${(error as Error).message}`);
  }
};

export default updateTenant;
