import db, { maintenanceRecord, property, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchMaintenanceSchema } from '@schemas';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const searchMaintenance: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const queryValidation = searchMaintenanceSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 20, search } = queryValidation.data;

    // Build query conditions - only show maintenance records for user's properties
    const conditions = [
      eq(property.userId, requestingUserId),
      eq(maintenanceRecord.isDeleted, false),
    ];

    if (search) {
      const searchCondition = or(
        ilike(maintenanceRecord.issue, `%${search}%`),
        ilike(maintenanceRecord.description, `%${search}%`),
        ilike(maintenanceRecord.notes, `%${search}%`),
        ilike(maintenanceRecord.contractorName, `%${search}%`),
        ilike(maintenanceRecord.contractorPhone, `%${search}%`),
        ilike(maintenanceRecord.cost, `%${search}%`),
        ilike(maintenanceRecord.reportedDate, `%${search}%`),
        ilike(maintenanceRecord.assignedTo, `%${search}%`),

        ilike(property.title, `%${search}%`),
        ilike(property.address, `%${search}%`),
        ilike(property.propertyType, `%${search}%`),
        ilike(property.country, `%${search}%`),
        ilike(property.description, `%${search}%`),
        ilike(property.status, `%${search}%`),
        ilike(property.price, `%${search}%`),

        ilike(tenant.firstName, `%${search}%`),
        ilike(tenant.lastName, `%${search}%`),
        ilike(tenant.email, `%${search}%`),
        ilike(tenant.mobile, `%${search}%`),
        ilike(tenant.passportNumber, `%${search}%`),
        ilike(tenant.nationalId, `%${search}%`),
        ilike(tenant.rentAmount, `%${search}%`),
        ilike(tenant.emergencyContactName, `%${search}%`),
        ilike(tenant.emergencyContactPhone, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Get maintenance records with pagination
    const maintenanceRecords = await db
      .select({
        maintenance: maintenanceRecord,
        property: {
          id: property.id,
          title: property.title,
          address: property.address,
          propertyType: property.propertyType,
        },
        tenant: {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
          mobile: tenant.mobile,
        },
      })
      .from(maintenanceRecord)
      .innerJoin(property, eq(maintenanceRecord.propertyId, property.id))
      .leftJoin(tenant, eq(maintenanceRecord.tenantId, tenant.id))
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(maintenanceRecord.reportedDate);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(maintenanceRecord)
      .innerJoin(property, eq(maintenanceRecord.propertyId, property.id))
      .leftJoin(tenant, eq(maintenanceRecord.tenantId, tenant.id))
      .where(and(...conditions));

    const totalMaintenanceRecords = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalMaintenanceRecords / limit);

    sendSuccessResponse(response, 200, 'Maintenance records retrieved successfully', {
      maintenanceRecords,
      pagination: {
        page,
        limit,
        total: totalMaintenanceRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
      },
    });
  } catch (error) {
    logError(error, 'SEARCH_MAINTENANCE');
    sendErrorResponse(response, 500, 'Failed to search maintenance records.');
  }
};

export default searchMaintenance;
