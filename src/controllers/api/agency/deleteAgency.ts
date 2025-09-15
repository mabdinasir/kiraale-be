import db, { agency } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getAgencyByIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
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
    // Soft delete by setting isActive to false
    const [deletedAgency] = await db
      .update(agency)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(agency.id, id))
      .returning();

    sendSuccessResponse(response, 200, 'Agency deleted successfully', {
      agency: deletedAgency,
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
