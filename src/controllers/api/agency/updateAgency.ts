import db, { agency } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { getAgencyByIdSchema, updateAgencySchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateAgency: RequestHandler = async (request, response) => {
  try {
    const validatedParams = getAgencyByIdSchema.parse(request.params);
    const validatedData = updateAgencySchema.parse(request.body);
    const { id } = validatedParams;

    // Check if agency exists
    const [existingAgency] = await db.select().from(agency).where(eq(agency.id, id));

    if (!existingAgency) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Permission checks are now handled by middleware
    // Update the agency
    const [updatedAgency] = await db
      .update(agency)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(agency.id, id))
      .returning();

    response.status(200).json({
      success: true,
      message: 'Agency updated successfully',
      data: {
        agency: updatedAgency,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_AGENCY');
    sendErrorResponse(response, 500, `Agency update failed: ${(error as Error).message}`);
  }
};

export default updateAgency;
