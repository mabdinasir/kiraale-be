import db, { maintenanceRecord, property, type MaintenanceRecord } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { maintenanceIdSchema, updateMaintenanceSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateMaintenance: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: maintenanceId } = maintenanceIdSchema.parse(request.params);
    const validatedData = updateMaintenanceSchema.parse(request.body);

    // Get maintenance record with property info to verify ownership
    const [maintenanceData] = await db
      .select({
        maintenance: maintenanceRecord,
        property,
      })
      .from(maintenanceRecord)
      .innerJoin(property, eq(maintenanceRecord.propertyId, property.id))
      .where(eq(maintenanceRecord.id, maintenanceId));

    if (!maintenanceData) {
      sendErrorResponse(response, 404, 'Maintenance record not found');
      return;
    }

    if (maintenanceData.property.userId !== requestingUserId) {
      sendErrorResponse(
        response,
        403,
        'You can only update maintenance records for your own properties',
      );
      return;
    }

    // Update maintenance record
    const updateData: Partial<MaintenanceRecord> & Pick<MaintenanceRecord, 'updatedAt'> = {
      updatedAt: new Date(),
    };

    if (validatedData.issue) {
      updateData.issue = validatedData.issue;
    }
    if (validatedData.description) {
      updateData.description = validatedData.description;
    }
    if (validatedData.urgency) {
      updateData.urgency = validatedData.urgency;
    }
    if (validatedData.assignedTo !== undefined) {
      updateData.assignedTo = validatedData.assignedTo;
    }
    if (validatedData.startedDate) {
      updateData.startedDate = validatedData.startedDate;
    }
    if (validatedData.completedDate) {
      updateData.completedDate = validatedData.completedDate;
    }
    if (validatedData.cost) {
      updateData.cost = validatedData.cost.toString();
    }
    if (validatedData.isFixed !== undefined) {
      updateData.isFixed = validatedData.isFixed;
    }
    if (validatedData.warrantyExpiry) {
      updateData.warrantyExpiry = validatedData.warrantyExpiry;
    }
    if (validatedData.contractorName !== undefined) {
      updateData.contractorName = validatedData.contractorName;
    }
    if (validatedData.contractorPhone !== undefined) {
      updateData.contractorPhone = validatedData.contractorPhone;
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    const [updatedMaintenance] = await db
      .update(maintenanceRecord)
      .set(updateData)
      .where(eq(maintenanceRecord.id, maintenanceId))
      .returning();

    sendSuccessResponse(
      response,
      200,
      'Maintenance record updated successfully',
      updatedMaintenance,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_MAINTENANCE');
    sendErrorResponse(
      response,
      500,
      `Maintenance record update failed: ${(error as Error).message}`,
    );
  }
};

export default updateMaintenance;
