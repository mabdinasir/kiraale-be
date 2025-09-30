import db, { property, propertyInspection } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { inspectionIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteInspection: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: inspectionId } = inspectionIdSchema.parse(request.params);

    // Get inspection with property info to verify ownership
    const [inspectionData] = await db
      .select({
        propertyInspection,
        property,
      })
      .from(propertyInspection)
      .innerJoin(property, eq(propertyInspection.propertyId, property.id))
      .where(and(eq(propertyInspection.id, inspectionId), eq(propertyInspection.isDeleted, false)));

    if (!inspectionData) {
      sendErrorResponse(response, 404, 'Inspection not found');
      return;
    }

    if (inspectionData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only delete inspections for your own properties');
      return;
    }

    // Soft delete the inspection
    const [deletedInspection] = await db
      .update(propertyInspection)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(propertyInspection.id, inspectionId))
      .returning();

    sendSuccessResponse(response, 200, 'Inspection deleted successfully', {
      inspection: deletedInspection,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_INSPECTION');
    sendErrorResponse(response, 500, `Failed to delete inspection: ${(error as Error).message}`);
  }
};

export default deleteInspection;
