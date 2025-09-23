import db, { agencyAgent, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { updateAgentRoleSchema } from '@schemas';
import { and, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateAgentRole: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { agencyId, userId } = request.params;
    const validatedData = updateAgentRoleSchema.parse(request.body);
    const { role: newRole } = validatedData;

    if (!agencyId || !userId) {
      sendErrorResponse(response, 400, 'Agency ID and User ID are required');
      return;
    }

    // Check if agency agent exists and is active
    const [existingAgent] = await db
      .select({
        id: agencyAgent.id,
        role: agencyAgent.role,
        agencyId: agencyAgent.agencyId,
        userId: agencyAgent.userId,
      })
      .from(agencyAgent)
      .where(
        and(
          eq(agencyAgent.agencyId, agencyId),
          eq(agencyAgent.userId, userId),
          eq(agencyAgent.isActive, true),
        ),
      );

    if (!existingAgent) {
      sendErrorResponse(response, 404, 'Active agent not found in this agency');
      return;
    }

    // If trying to downgrade from AGENCY_ADMIN to AGENT, check if there are other admins
    if (existingAgent.role === 'AGENCY_ADMIN' && newRole === 'AGENT') {
      const [{ adminCount }] = await db
        .select({ adminCount: sql<number>`count(*)::int` })
        .from(agencyAgent)
        .where(
          and(
            eq(agencyAgent.agencyId, agencyId),
            eq(agencyAgent.role, 'AGENCY_ADMIN'),
            eq(agencyAgent.isActive, true),
          ),
        );

      if (adminCount <= 1) {
        sendErrorResponse(
          response,
          400,
          'Cannot downgrade the last agency admin. At least one admin must remain.',
        );
        return;
      }
    }

    // Permission checks are handled by middleware - only agency admins and platform admins can update roles

    // Update the agent role
    const [updatedAgent] = await db
      .update(agencyAgent)
      .set({
        role: newRole,
      })
      .where(eq(agencyAgent.id, existingAgent.id))
      .returning();

    // Get the full agent details for response
    const [agentWithDetails] = await db
      .select({
        id: agencyAgent.id,
        role: agencyAgent.role,
        isActive: agencyAgent.isActive,
        joinedAt: agencyAgent.joinedAt,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          agentNumber: user.agentNumber,
        },
      })
      .from(agencyAgent)
      .leftJoin(user, eq(agencyAgent.userId, user.id))
      .where(eq(agencyAgent.id, updatedAgent.id));

    sendSuccessResponse(response, 200, 'Agent role updated successfully', {
      agent: agentWithDetails,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_AGENT_ROLE');
    sendErrorResponse(response, 500, `Failed to update agent role: ${(error as Error).message}`);
  }
};

export default updateAgentRole;
