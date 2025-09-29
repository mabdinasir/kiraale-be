import db, { maintenanceRecord, property, tenant, user } from '@db';
import { logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { maintenanceIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMaintenance: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: maintenanceId } = maintenanceIdSchema.parse(request.params);

    // Get maintenance record with all related data
    const [maintenanceData] = await db
      .select({
        maintenance: {
          id: maintenanceRecord.id,
          propertyId: maintenanceRecord.propertyId,
          tenantId: maintenanceRecord.tenantId,
          issue: maintenanceRecord.issue,
          description: maintenanceRecord.description,
          urgency: maintenanceRecord.urgency,
          reportedDate: maintenanceRecord.reportedDate,
          assignedTo: maintenanceRecord.assignedTo,
          startedDate: maintenanceRecord.startedDate,
          completedDate: maintenanceRecord.completedDate,
          cost: maintenanceRecord.cost,
          isFixed: maintenanceRecord.isFixed,
          warrantyExpiry: maintenanceRecord.warrantyExpiry,
          contractorName: maintenanceRecord.contractorName,
          contractorPhone: maintenanceRecord.contractorPhone,
          notes: maintenanceRecord.notes,
          isDeleted: maintenanceRecord.isDeleted,
          createdAt: maintenanceRecord.createdAt,
          updatedAt: maintenanceRecord.updatedAt,
        },
        property: {
          id: property.id,
          title: property.title,
          address: property.address,
          propertyType: property.propertyType,
        },
        propertyOwner: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        tenant: {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
        },
      })
      .from(maintenanceRecord)
      .innerJoin(property, eq(maintenanceRecord.propertyId, property.id))
      .innerJoin(user, eq(property.userId, user.id))
      .leftJoin(tenant, eq(maintenanceRecord.tenantId, tenant.id))
      .where(eq(maintenanceRecord.id, maintenanceId));

    if (!maintenanceData) {
      sendErrorResponse(response, 404, 'Maintenance record not found');
      return;
    }

    // Verify ownership - user can only view maintenance records for their own properties
    if (maintenanceData.propertyOwner.id !== requestingUserId) {
      sendErrorResponse(
        response,
        403,
        'You can only view maintenance records for your own properties',
      );
      return;
    }

    // Check if maintenance record is deleted
    if (maintenanceData.maintenance.isDeleted) {
      sendErrorResponse(response, 404, 'Maintenance record not found');
      return;
    }

    const daysOpen = maintenanceData.maintenance.completedDate
      ? Math.ceil(
          (new Date(maintenanceData.maintenance.completedDate).getTime() -
            new Date(maintenanceData.maintenance.reportedDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : Math.ceil(
          (new Date().getTime() - new Date(maintenanceData.maintenance.reportedDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );

    sendSuccessResponse(response, 200, 'Maintenance record retrieved successfully', {
      maintenance: {
        ...maintenanceData.maintenance,
        daysOpen,
        hasContractor: Boolean(
          maintenanceData.maintenance.contractorName ?? maintenanceData.maintenance.contractorPhone,
        ),
        isUnderWarranty: maintenanceData.maintenance.warrantyExpiry
          ? new Date(maintenanceData.maintenance.warrantyExpiry) > new Date()
          : false,
      },
      property: maintenanceData.property,
      propertyOwner: maintenanceData.propertyOwner,
      tenant: maintenanceData.tenant, // Will be null if no tenant associated
      contractor:
        maintenanceData.maintenance.contractorName || maintenanceData.maintenance.contractorPhone
          ? {
              name: maintenanceData.maintenance.contractorName,
              phone: maintenanceData.maintenance.contractorPhone,
            }
          : null,
      assignment: {
        assignedTo: maintenanceData.maintenance.assignedTo,
        startedDate: maintenanceData.maintenance.startedDate,
        completedDate: maintenanceData.maintenance.completedDate,
      },
      financial: {
        cost: maintenanceData.maintenance.cost,
        warrantyExpiry: maintenanceData.maintenance.warrantyExpiry,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendErrorResponse(response, 400, 'Invalid maintenance ID format');
      return;
    }

    logError(error, 'GET_MAINTENANCE');
    sendErrorResponse(
      response,
      500,
      `Failed to retrieve maintenance record: ${(error as Error).message}`,
    );
  }
};

export default getMaintenance;
