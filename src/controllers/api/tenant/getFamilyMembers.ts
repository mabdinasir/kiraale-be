import db, { property, tenant, tenantFamilyMember } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getFamilyMembersSchema, tenantIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getFamilyMembers: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const queryParams = getFamilyMembersSchema.parse(request.query);

    // Get tenant with property info to verify ownership
    const [tenantData] = await db
      .select({
        tenant,
        property,
      })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(tenant.id, tenantId));

    if (!tenantData) {
      sendErrorResponse(response, 404, 'Tenant not found');
      return;
    }

    if (tenantData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only view family members for your own properties');
      return;
    }

    // Pagination
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const offset = (page - 1) * limit;

    // Get family members
    const familyMembers = await db
      .select()
      .from(tenantFamilyMember)
      .where(eq(tenantFamilyMember.tenantId, tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(tenantFamilyMember.createdAt);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: tenantFamilyMember.id })
      .from(tenantFamilyMember)
      .where(eq(tenantFamilyMember.tenantId, tenantId));

    const totalCount = Number(count) || 0;
    const totalPages = Math.ceil(totalCount / limit);

    sendSuccessResponse(response, 200, 'Family members retrieved successfully', {
      familyMembers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_FAMILY_MEMBERS');
    sendErrorResponse(
      response,
      500,
      `Failed to retrieve family members: ${(error as Error).message}`,
    );
  }
};

export default getFamilyMembers;
