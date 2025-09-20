import db, { property, tenant, tenantFamilyMember } from '@db';
import { logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { familyMemberIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const removeFamilyMember: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: familyMemberId } = familyMemberIdSchema.parse(request.params);

    // Get family member with tenant and property info to verify ownership
    const [familyMemberData] = await db
      .select({
        familyMember: tenantFamilyMember,
        tenant,
        property,
      })
      .from(tenantFamilyMember)
      .innerJoin(tenant, eq(tenantFamilyMember.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(tenantFamilyMember.id, familyMemberId));

    if (!familyMemberData) {
      sendErrorResponse(response, 404, 'Family member not found');
      return;
    }

    if (familyMemberData.property.userId !== requestingUserId) {
      sendErrorResponse(
        response,
        403,
        'You can only remove family members for your own properties',
      );
      return;
    }

    // Delete family member
    await db.delete(tenantFamilyMember).where(eq(tenantFamilyMember.id, familyMemberId));

    sendSuccessResponse(response, 200, 'Family member removed successfully', {
      familyMemberId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendErrorResponse(response, 400, 'Invalid family member ID format');
      return;
    }

    logError(error, 'REMOVE_FAMILY_MEMBER');
    sendErrorResponse(response, 500, `Failed to remove family member: ${(error as Error).message}`);
  }
};

export default removeFamilyMember;
