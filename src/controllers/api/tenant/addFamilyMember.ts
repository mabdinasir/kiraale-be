import db, { property, tenant, tenantFamilyMember } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { createFamilyMemberSchema, tenantIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const addFamilyMember: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const validatedData = createFamilyMemberSchema.parse(request.body);

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
      sendErrorResponse(
        response,
        403,
        'You can only manage family members for your own properties',
      );
      return;
    }

    // Create family member
    const [newFamilyMember] = await db
      .insert(tenantFamilyMember)
      .values({
        tenantId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        mobile: validatedData.mobile,
        relationship: validatedData.relationship,
        age: validatedData.age,
        nationalId: validatedData.nationalId,
        isMinor: validatedData.isMinor,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    sendSuccessResponse(response, 201, 'Family member added successfully', newFamilyMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADD_FAMILY_MEMBER');
    sendErrorResponse(response, 500, `Failed to add family member: ${(error as Error).message}`);
  }
};

export default addFamilyMember;
