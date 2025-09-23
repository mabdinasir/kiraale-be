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
    const updatedData: Partial<Tenant> & Pick<Tenant, 'updatedAt'> = {
      updatedAt: new Date(),
    };

    if (validatedData.firstName) {
      updatedData.firstName = validatedData.firstName;
    }
    if (validatedData.lastName) {
      updatedData.lastName = validatedData.lastName;
    }
    if (validatedData.email) {
      updatedData.email = validatedData.email;
    }
    if (validatedData.mobile) {
      updatedData.mobile = validatedData.mobile;
    }
    if (validatedData.nationalId !== undefined) {
      updatedData.nationalId = validatedData.nationalId;
    }
    if (validatedData.passportNumber !== undefined) {
      updatedData.passportNumber = validatedData.passportNumber;
    }
    if (validatedData.emergencyContactName) {
      updatedData.emergencyContactName = validatedData.emergencyContactName;
    }
    if (validatedData.emergencyContactPhone) {
      updatedData.emergencyContactPhone = validatedData.emergencyContactPhone;
    }
    if (validatedData.leaseType) {
      updatedData.leaseType = validatedData.leaseType;
    }
    if (validatedData.leaseFrequency) {
      updatedData.leaseFrequency = validatedData.leaseFrequency;
    }
    if (validatedData.rentAmount) {
      updatedData.rentAmount = validatedData.rentAmount.toString();
    }
    if (validatedData.leaseStartDate) {
      updatedData.leaseStartDate = new Date(validatedData.leaseStartDate);
    }
    if (validatedData.leaseType === 'MONTH_TO_MONTH') {
      updatedData.leaseEndDate = null;
    } else {
      updatedData.leaseEndDate = validatedData.leaseEndDate
        ? new Date(validatedData.leaseEndDate)
        : null;
    }

    const [updatedTenant] = await db
      .update(tenant)
      .set(updatedData)
      .where(eq(tenant.id, tenantId))
      .returning();

    sendSuccessResponse(response, 200, 'Tenant updated successfully', {
      tenant: updatedTenant,
    });
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
