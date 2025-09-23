import db, { property, tenant, tenantFamilyMember, type TenantFamilyMember } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { familyMemberIdSchema, updateFamilyMemberSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateFamilyMember: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: familyMemberId } = familyMemberIdSchema.parse(request.params);
    const validatedData = updateFamilyMemberSchema.parse(request.body);

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
        'You can only update family members for your own properties',
      );
      return;
    }

    // Update family member
    const updateData: Partial<TenantFamilyMember> & Pick<TenantFamilyMember, 'updatedAt'> = {
      updatedAt: new Date(),
    };

    if (validatedData.firstName) {
      updateData.firstName = validatedData.firstName;
    }
    if (validatedData.lastName) {
      updateData.lastName = validatedData.lastName;
    }
    if (validatedData.email !== undefined) {
      updateData.email = validatedData.email;
    }
    if (validatedData.mobile !== undefined) {
      updateData.mobile = validatedData.mobile;
    }
    if (validatedData.relationship) {
      updateData.relationship = validatedData.relationship;
    }
    if (validatedData.age) {
      updateData.age = validatedData.age;
    }
    if (validatedData.nationalId !== undefined) {
      updateData.nationalId = validatedData.nationalId;
    }
    if (validatedData.isMinor !== undefined) {
      updateData.isMinor = validatedData.isMinor;
    }

    const [updatedFamilyMember] = await db
      .update(tenantFamilyMember)
      .set(updateData)
      .where(eq(tenantFamilyMember.id, familyMemberId))
      .returning();

    sendSuccessResponse(response, 200, 'Family member updated successfully', {
      familyMember: updatedFamilyMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_FAMILY_MEMBER');
    sendErrorResponse(response, 500, `Family member update failed: ${(error as Error).message}`);
  }
};

export default updateFamilyMember;
