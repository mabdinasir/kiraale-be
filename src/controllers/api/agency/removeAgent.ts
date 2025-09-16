import db, { agency, agencyAgent } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { removeAgentFromAgencySchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const removeAgent: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const validatedData = removeAgentFromAgencySchema.parse({
      ...request.params,
      ...request.body,
    });
    const { agencyId, userId } = validatedData;

    // Check if agency exists
    const [existingAgency] = await db.select().from(agency).where(eq(agency.id, agencyId));

    if (!existingAgency) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Check if agent exists and is active
    const [existingAgent] = await db
      .select()
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

    // Permission checks are now handled by middleware

    // Remove the agent and update user role in transaction
    await db.transaction(async (tx) => {
      // Soft delete the agency-agent relationship
      await tx
        .update(agencyAgent)
        .set({
          isActive: false,
          leftAt: new Date(),
        })
        .where(eq(agencyAgent.id, existingAgent.id));

      // Users keep their platform role (USER/ADMIN) and agentNumber for historical tracking
      // No user table updates needed - only agency relationship is deactivated
    });

    response.status(200).json({
      success: true,
      message: 'Agent removed from agency successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'REMOVE_AGENT_FROM_AGENCY');
    sendErrorResponse(
      response,
      500,
      `Failed to remove agent from agency: ${(error as Error).message}`,
    );
  }
};

export default removeAgent;
