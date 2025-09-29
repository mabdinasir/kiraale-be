import db, { property, propertyInspection, tenant, user } from '@db';
import { logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { inspectionIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getInspection: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: inspectionId } = inspectionIdSchema.parse(request.params);

    // Get inspection with all related data
    const [inspectionData] = await db
      .select({
        inspection: {
          id: propertyInspection.id,
          propertyId: propertyInspection.propertyId,
          tenantId: propertyInspection.tenantId,
          inspectionDate: propertyInspection.inspectionDate,
          inspectionType: propertyInspection.inspectionType,
          notes: propertyInspection.notes,
          overallRating: propertyInspection.overallRating,
          inspectedBy: propertyInspection.inspectedBy,
          isDeleted: propertyInspection.isDeleted,
          createdAt: propertyInspection.createdAt,
          updatedAt: propertyInspection.updatedAt,
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
      .from(propertyInspection)
      .innerJoin(property, eq(propertyInspection.propertyId, property.id))
      .innerJoin(user, eq(property.userId, user.id))
      .leftJoin(tenant, eq(propertyInspection.tenantId, tenant.id))
      .where(eq(propertyInspection.id, inspectionId));

    if (!inspectionData) {
      sendErrorResponse(response, 404, 'Inspection not found');
      return;
    }

    // Verify ownership - user can only view inspections for their own properties
    if (inspectionData.propertyOwner.id !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only view inspections for your own properties');
      return;
    }

    // Check if inspection is deleted
    if (inspectionData.inspection.isDeleted) {
      sendErrorResponse(response, 404, 'Inspection not found');
      return;
    }

    // Calculate inspection metadata
    const daysSinceInspection = Math.ceil(
      (new Date().getTime() - new Date(inspectionData.inspection.inspectionDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Determine if inspection is recent (within last 30 days)
    const isRecentInspection = daysSinceInspection <= 30;

    sendSuccessResponse(response, 200, 'Inspection retrieved successfully', {
      inspection: {
        ...inspectionData.inspection,
        daysSinceInspection,
        isRecentInspection,
        ratingText: `${inspectionData.inspection.overallRating}/10`,
      },
      property: inspectionData.property,
      propertyOwner: inspectionData.propertyOwner,
      tenant: inspectionData.tenant, // Will be null if no tenant associated
      inspector: {
        name: inspectionData.inspection.inspectedBy,
        inspectionDate: inspectionData.inspection.inspectionDate,
      },
      rating: {
        score: inspectionData.inspection.overallRating,
        maxScore: 10,
        percentage: (inspectionData.inspection.overallRating / 10) * 100,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendErrorResponse(response, 400, 'Invalid inspection ID format');
      return;
    }

    logError(error, 'GET_INSPECTION');
    sendErrorResponse(response, 500, `Failed to retrieve inspection: ${(error as Error).message}`);
  }
};

export default getInspection;
