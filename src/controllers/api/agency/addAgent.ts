import db from '@db/index';
import { agency, agencyAgent, user } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { addAgentToAgencySchema, getAgencyByIdSchema } from '@schemas/agency.schema';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const addAgent: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const validatedParams = getAgencyByIdSchema.parse(request.params);
    const validatedData = addAgentToAgencySchema.parse(request.body);
    const { id: agencyId } = validatedParams;
    const { userId, role } = validatedData;

    // Check if agency exists
    const [existingAgency] = await db.select().from(agency).where(eq(agency.id, agencyId));

    if (!existingAgency) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Check if target user exists
    const [targetUser] = await db.select().from(user).where(eq(user.id, userId));

    if (!targetUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    // Permission checks are now handled by middleware

    // Check if user is already an active agent in ANY agency (user can only be in one agency)
    const [existingAgentInAnyAgency] = await db
      .select()
      .from(agencyAgent)
      .where(and(eq(agencyAgent.userId, userId), eq(agencyAgent.isActive, true)));

    if (existingAgentInAnyAgency) {
      sendErrorResponse(
        response,
        400,
        'User is already an active agent in another agency. Users can only belong to one agency at a time.',
      );
      return;
    }

    // Add the agent and update user in a transaction
    const result = await db.transaction(async (tx) => {
      // Insert the agency-agent relationship
      const [newAgentRecord] = await tx
        .insert(agencyAgent)
        .values({
          agencyId,
          userId,
          role,
          isActive: true,
          joinedAt: new Date(),
        })
        .returning();

      // Generate agent number based on agency and sequence
      const agentCount = await tx
        .select({ count: agencyAgent.id })
        .from(agencyAgent)
        .where(eq(agencyAgent.agencyId, agencyId));

      const agentNumber = `${existingAgency.name.substring(0, 3).toUpperCase()}${String(Number(agentCount[0]?.count || 0) + 1).padStart(4, '0')}`;

      // Update user's agentNumber and role if they become an agent
      const userRoleUpdate = targetUser.role === 'USER' ? 'AGENT' : targetUser.role;

      await tx
        .update(user)
        .set({
          agentNumber,
          role: userRoleUpdate,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return newAgentRecord;
    });

    const newAgentRecord = result;

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
        },
      })
      .from(agencyAgent)
      .leftJoin(user, eq(agencyAgent.userId, user.id))
      .where(eq(agencyAgent.id, newAgentRecord.id));

    response.status(201).json({
      success: true,
      message: 'Agent added to agency successfully',
      data: {
        agent: agentWithDetails,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADD_AGENT_TO_AGENCY');
    sendErrorResponse(response, 500, `Failed to add agent to agency: ${(error as Error).message}`);
  }
};

export default addAgent;
