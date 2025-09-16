import db, { agency, agencyAgent, user } from '@db';
import {
  generateJwtToken,
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
import { createAgencySchema } from '@schemas';
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

      // Check if user already has an agentNumber - if so, keep it
      let { agentNumber } = currentUser;

      if (!agentNumber) {
        // Generate new agent number based on agency name
        agentNumber = `${newAgency.name.substring(0, 3).toUpperCase()}0001`;

        // No platform role changes - users keep their current platform role (USER/ADMIN)
        // Only add agentNumber for tracking purposes
        await tx
          .update(user)
          .set({
            agentNumber,
            updatedAt: new Date(),
          })
          .where(eq(user.id, requestingUserId));
      }

      // Add user as agency admin
      const [agencyMembership] = await tx
        .insert(agencyAgent)
        .values({
          agencyId: newAgency.id,
          userId: requestingUserId,
          role: 'AGENCY_ADMIN', // Agency admin (not platform admin)
          isActive: true,
          joinedAt: new Date(),
        })
        .returning();

      return { newAgency, agencyMembership, agentNumber };
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
      'Agency created successfully. You are now an agency admin.',
      {
        agency: result.newAgency,
        agentNumber: result.agentNumber,
        agencyMembership: result.agencyMembership,
        jwt: freshJwtToken,
        user: updatedUser,
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
