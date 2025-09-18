import db, { agency } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { suspendAgencySchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const suspendAgency: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id } = request.params;
    const validatedData = suspendAgencySchema.parse(request.body);
    const { suspensionReason } = validatedData;

    if (!id) {
      sendErrorResponse(response, 400, 'Agency ID is required');
      return;
    }

    // Check if agency exists
    const [existingAgency] = await db.select().from(agency).where(eq(agency.id, id));

    if (!existingAgency) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Toggle suspension status
    const isSuspending = !existingAgency.isSuspended;

    const updateData = isSuspending
      ? {
          // Suspending - set inactive and suspended
          isActive: false,
          isSuspended: true,
          suspendedAt: new Date(),
          suspendedBy: requestingUserId,
          suspensionReason,
          updatedAt: new Date(),
        }
      : {
          // Unsuspending - set active and unsuspended
          isActive: true,
          isSuspended: false,
          suspendedAt: null,
          suspendedBy: null,
          suspensionReason: null,
          updatedAt: new Date(),
        };

    const [updatedAgency] = await db
      .update(agency)
      .set(updateData)
      .where(eq(agency.id, id))
      .returning();

    const actionMessage = isSuspending ? 'suspended' : 'unsuspended';

    sendSuccessResponse(response, 200, `Agency ${actionMessage} successfully`, {
      agency: updatedAgency,
      action: isSuspending ? 'suspended' : 'unsuspended',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADMIN_TOGGLE_AGENCY_SUSPENSION');
    sendErrorResponse(
      response,
      500,
      `Failed to toggle agency suspension: ${(error as Error).message}`,
    );
  }
};

export default suspendAgency;
