import db, { agency, agencyAgent, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getAgencyByIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteAgency: RequestHandler = async (request, response) => {
  try {
    const validatedParams = getAgencyByIdSchema.parse(request.params);
    const { id } = validatedParams;

    // Check if agency exists
    const [existingAgency] = await db.select().from(agency).where(eq(agency.id, id));

    if (!existingAgency) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Permission checks are now handled by middleware
    // Use transaction to handle agency deletion and agent cleanup
    const result = await db.transaction(async (tx) => {
      // Soft delete the agency
      const [deletedAgency] = await tx
        .update(agency)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(agency.id, id))
        .returning();

      // Get all active agents in this agency
      const activeAgents = await tx
        .select({
          id: agencyAgent.id,
          userId: agencyAgent.userId,
          userRole: user.role,
        })
        .from(agencyAgent)
        .leftJoin(user, eq(agencyAgent.userId, user.id))
        .where(and(eq(agencyAgent.agencyId, id), eq(agencyAgent.isActive, true)));

      // Soft delete all agency-agent relationships
      if (activeAgents.length > 0) {
        await tx
          .update(agencyAgent)
          .set({
            isActive: false,
            leftAt: new Date(),
          })
          .where(and(eq(agencyAgent.agencyId, id), eq(agencyAgent.isActive, true)));

        // Keep agentNumber for all agents for historical tracking
        // Platform roles and agentNumbers remain unchanged
        // Only agency relationships are deactivated
      }

      return { deletedAgency, affectedAgents: activeAgents.length };
    });

    sendSuccessResponse(response, 200, 'Agency deleted successfully', {
      agency: result.deletedAgency,
      affectedAgents: result.affectedAgents,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_AGENCY');
    sendErrorResponse(response, 500, `Agency deletion failed: ${(error as Error).message}`);
  }
};

export default deleteAgency;
