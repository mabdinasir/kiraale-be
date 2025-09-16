import db, { agency, agencyAgent } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getAgencyByIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const adminDeleteAgency: RequestHandler = async (request, response) => {
  try {
    const validatedParams = getAgencyByIdSchema.parse(request.params);
    const { id } = validatedParams;

    // Check if agency exists
    const [existingAgency] = await db.select().from(agency).where(eq(agency.id, id));

    if (!existingAgency) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Use transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Get all active agents for this agency before deletion

      // Keep user platform roles and agentNumbers for historical tracking
      // No user table updates needed - agency relationships are handled separately

      // Deactivate all agency agents (cascade will handle deletion)
      await tx
        .update(agencyAgent)
        .set({
          isActive: false,
          leftAt: new Date(),
        })
        .where(eq(agencyAgent.agencyId, id));

      // Hard delete the agency (admin has full delete power)
      await tx.delete(agency).where(eq(agency.id, id));
    });

    sendSuccessResponse(response, 200, 'Agency deleted successfully by admin', {
      deletedAgency: {
        id: existingAgency.id,
        name: existingAgency.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADMIN_DELETE_AGENCY');
    sendErrorResponse(response, 500, `Failed to delete agency: ${(error as Error).message}`);
  }
};

export default adminDeleteAgency;
