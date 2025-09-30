import db, { property, propertyInspection, type PropertyInspection } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { inspectionIdSchema, updateInspectionSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateInspection: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: inspectionId } = inspectionIdSchema.parse(request.params);
    const validatedData = updateInspectionSchema.parse(request.body);

    // Get inspection with property info to verify ownership
    const [inspectionData] = await db
      .select({
        inspection: propertyInspection,
        property,
      })
      .from(propertyInspection)
      .innerJoin(property, eq(propertyInspection.propertyId, property.id))
      .where(eq(propertyInspection.id, inspectionId));

    if (!inspectionData) {
      sendErrorResponse(response, 404, 'Inspection not found');
      return;
    }

    if (inspectionData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only update inspections for your own properties');
      return;
    }

    // Update inspection
    const updateData: Partial<PropertyInspection> & Pick<PropertyInspection, 'updatedAt'> = {
      updatedAt: new Date(),
    };

    if (validatedData.inspectionDate) {
      updateData.inspectionDate = validatedData.inspectionDate;
    }
    if (validatedData.inspectionType) {
      updateData.inspectionType = validatedData.inspectionType;
    }
    if (validatedData.notes) {
      updateData.notes = validatedData.notes;
    }
    if (validatedData.overallRating) {
      updateData.overallRating = validatedData.overallRating;
    }
    if (validatedData.inspectedBy) {
      updateData.inspectedBy = validatedData.inspectedBy;
    }

    const [updatedInspection] = await db
      .update(propertyInspection)
      .set(updateData)
      .where(eq(propertyInspection.id, inspectionId))
      .returning();

    sendSuccessResponse(response, 200, 'Inspection updated successfully', updatedInspection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_INSPECTION');
    sendErrorResponse(response, 500, `Inspection update failed: ${(error as Error).message}`);
  }
};

export default updateInspection;
