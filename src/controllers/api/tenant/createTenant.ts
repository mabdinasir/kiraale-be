import db, { property, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { createTenantSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createTenant: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const validatedData = createTenantSchema.parse(request.body);

    // Verify property exists and belongs to the user
    const [propertyExists] = await db
      .select()
      .from(property)
      .where(eq(property.id, validatedData.propertyId));

    if (!propertyExists) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    if (propertyExists.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only add tenants to your own properties');
      return;
    }

    // Create tenant - handle date conversion
    const [newTenant] = await db
      .insert(tenant)
      .values({
        propertyId: validatedData.propertyId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        mobile: validatedData.mobile,
        nationalId: validatedData.nationalId,
        passportNumber: validatedData.passportNumber,
        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactPhone: validatedData.emergencyContactPhone,
        leaseType: validatedData.leaseType,
        leaseFrequency: validatedData.leaseFrequency,
        rentAmount: validatedData.rentAmount.toString(),
        leaseStartDate: new Date(validatedData.leaseStartDate),
        leaseEndDate: validatedData.leaseEndDate ? new Date(validatedData.leaseEndDate) : null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    sendSuccessResponse(response, 201, 'Tenant created successfully', {
      tenant: newTenant,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_TENANT');
    sendErrorResponse(response, 500, `Tenant creation failed: ${(error as Error).message}`);
  }
};

export default createTenant;
