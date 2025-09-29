import db, { maintenanceRecord, property } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { maintenanceIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteMaintenance: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: maintenanceId } = maintenanceIdSchema.parse(request.params);

    // Get maintenance record with property info to verify ownership
    const [maintenanceData] = await db
      .select({
        maintenanceRecord,
        property,
      })
      .from(maintenanceRecord)
      .innerJoin(property, eq(maintenanceRecord.propertyId, property.id))
      .where(and(eq(maintenanceRecord.id, maintenanceId), eq(maintenanceRecord.isDeleted, false)));

    if (!maintenanceData) {
      sendErrorResponse(response, 404, 'Maintenance record not found');
      return;
    }

    if (maintenanceData.property.userId !== requestingUserId) {
      sendErrorResponse(
        response,
        403,
        'You can only delete maintenance records for your own properties',
      );
      return;
    }

    // Soft delete the maintenance record
    const [deletedMaintenance] = await db
      .update(maintenanceRecord)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceRecord.id, maintenanceId))
      .returning();

    sendSuccessResponse(response, 200, 'Maintenance record deleted successfully', {
      maintenance: deletedMaintenance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_MAINTENANCE');
    sendErrorResponse(
      response,
      500,
      `Failed to delete maintenance record: ${(error as Error).message}`,
    );
  }
};

export default deleteMaintenance;
