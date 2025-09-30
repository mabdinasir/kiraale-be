import db, { property, propertyInspection, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { createInspectionSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createInspection: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const validatedData = createInspectionSchema.parse(request.body);

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
      sendErrorResponse(response, 403, 'You can only create inspections for your own properties');
      return;
    }

    // Get active tenant for the property (if exists)
    const [activeTenant] = await db
      .select({ id: tenant.id })
      .from(tenant)
      .where(and(eq(tenant.propertyId, validatedData.propertyId), eq(tenant.isActive, true)))
      .limit(1);

    // Create inspection
    const [newInspection] = await db
      .insert(propertyInspection)
      .values({
        propertyId: validatedData.propertyId,
        tenantId: activeTenant?.id ?? null,
        inspectionDate: validatedData.inspectionDate,
        inspectionType: validatedData.inspectionType,
        notes: validatedData.notes,
        overallRating: validatedData.overallRating,
        inspectedBy: validatedData.inspectedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    sendSuccessResponse(response, 201, 'Property inspection created successfully', newInspection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_INSPECTION');
    sendErrorResponse(response, 500, `Inspection creation failed: ${(error as Error).message}`);
  }
};

export default createInspection;
