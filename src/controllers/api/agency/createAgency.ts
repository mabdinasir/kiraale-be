import db from '@db/index';
import { agency, agencyAgent, user } from '@db/schemas';
import { generateJwtToken } from '@lib/utils/auth/generateJwtToken';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { createAgencySchema } from '@schemas/agency.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createAgency: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const validatedData = createAgencySchema.parse(request.body);

    // Get current user info
    const [currentUser] = await db.select().from(user).where(eq(user.id, requestingUserId));

    if (!currentUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    // Use transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Create the agency
      const [newAgency] = await tx
        .insert(agency)
        .values({
          name: validatedData.name,
          description: validatedData.description,
          country: validatedData.country,
          address: validatedData.address,
          phone: validatedData.phone,
          email: validatedData.email,
          website: validatedData.website,
          licenseNumber: validatedData.licenseNumber,
          createdById: requestingUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Generate agent number based on agency name
      const agentNumber = `${newAgency.name.substring(0, 3).toUpperCase()}0001`;

      // Promote user to AGENT role if they're currently a USER
      const newRole = currentUser.role === 'USER' ? 'AGENT' : currentUser.role;

      await tx
        .update(user)
        .set({
          role: newRole,
          agentNumber,
          updatedAt: new Date(),
        })
        .where(eq(user.id, requestingUserId));

      // Add user as agency admin
      const [agencyMembership] = await tx
        .insert(agencyAgent)
        .values({
          agencyId: newAgency.id,
          userId: requestingUserId,
          role: 'ADMIN', // Agency admin (not platform admin)
          isActive: true,
          joinedAt: new Date(),
        })
        .returning();

      return { newAgency, agencyMembership, newRole, agentNumber };
    });

    // Get updated user data for fresh JWT
    const [updatedUser] = await db.select().from(user).where(eq(user.id, requestingUserId));

    if (!updatedUser) {
      sendErrorResponse(response, 500, 'Failed to retrieve updated user information');
      return;
    }

    // Generate fresh JWT with updated role
    const freshJwtToken = generateJwtToken(updatedUser);

    sendSuccessResponse(
      response,
      201,
      'Agency created successfully. You are now an agent and agency admin.',
      {
        agency: result.newAgency,
        userRole: result.newRole,
        agentNumber: result.agentNumber,
        agencyMembership: result.agencyMembership,
        jwt: freshJwtToken,
        user,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_AGENCY');
    sendErrorResponse(response, 500, `Agency creation failed: ${(error as Error).message}`);
  }
};

export default createAgency;
