import db, { agency, agencyAgent, user } from '@db';
import { generateAgentNumber, handleValidationError, logError, sendErrorResponse } from '@lib';
import { addAgentToAgencySchema, getAgencyByIdSchema } from '@schemas';
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

    // Check if there's an existing inactive record for this user-agency combination
    const [existingInactiveAgent] = await db
      .select()
      .from(agencyAgent)
      .where(
        and(
          eq(agencyAgent.userId, userId),
          eq(agencyAgent.agencyId, agencyId),
          eq(agencyAgent.isActive, false),
        ),
      );

    // Add the agent and update user in a transaction
    const result = await db.transaction(async (tx) => {
      // Handle reactivation or creation
      const agentRecord = existingInactiveAgent
        ? await tx
            .update(agencyAgent)
            .set({
              role,
              isActive: true,
              joinedAt: new Date(),
              leftAt: null, // Clear the leftAt date
            })
            .where(eq(agencyAgent.id, existingInactiveAgent.id))
            .returning()
            .then(([record]) => record)
        : await tx
            .insert(agencyAgent)
            .values({
              agencyId,
              userId,
              role,
              isActive: true,
              joinedAt: new Date(),
            })
            .returning()
            .then(([record]) => record);

      // Check if user already has an agentNumber - if so, keep it
      let { agentNumber } = targetUser;

      if (!agentNumber) {
        // Generate new agent number using utility function
        agentNumber = await generateAgentNumber(existingAgency.name, agencyId);

        // Update user's agentNumber but keep platform role unchanged (USER/ADMIN)
        await tx
          .update(user)
          .set({
            agentNumber,
            updatedAt: new Date(),
          })
          .where(eq(user.id, userId));
      }

      return agentRecord;
    });

    const finalAgentRecord = result;

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
      .where(eq(agencyAgent.id, finalAgentRecord.id));

    response.status(201).json({
      success: true,
      message: existingInactiveAgent
        ? 'Agent reactivated in agency successfully'
        : 'Agent added to agency successfully',
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
