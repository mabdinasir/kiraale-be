import db, { maintenanceRecord, property, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { createMaintenanceSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createMaintenance: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const validatedData = createMaintenanceSchema.parse(request.body);

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
      sendErrorResponse(
        response,
        403,
        'You can only create maintenance records for your own properties',
      );
      return;
    }

    // Get active tenant for the property (if exists)
    const [activeTenant] = await db
      .select({ id: tenant.id })
      .from(tenant)
      .where(and(eq(tenant.propertyId, validatedData.propertyId), eq(tenant.isActive, true)))
      .limit(1);

    // Create maintenance record
    const [newMaintenance] = await db
      .insert(maintenanceRecord)
      .values({
        propertyId: validatedData.propertyId,
        tenantId: activeTenant?.id ?? null,
        issue: validatedData.issue,
        description: validatedData.description,
        urgency: validatedData.urgency,
        reportedDate: validatedData.reportedDate,
        isFixed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    sendSuccessResponse(response, 201, 'Maintenance record created successfully', newMaintenance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_MAINTENANCE');
    sendErrorResponse(
      response,
      500,
      `Maintenance record creation failed: ${(error as Error).message}`,
    );
  }
};

export default createMaintenance;
