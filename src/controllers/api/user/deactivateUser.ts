import db, { user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { deactivateParamsSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deactivateUser: RequestHandler = async (request, response) => {
  const userId = request.user?.id;

  const { id } = deactivateParamsSchema.parse({ id: userId });

  try {
    // Check if user exists and is not already deleted
    const [existingUser] = await db.select().from(user).where(eq(user.id, id));

    if (!existingUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    if (!existingUser.isActive) {
      sendErrorResponse(response, 400, 'User account is already deactivated');
      return;
    }

    // Deactivate user by setting isActive to false
    await db
      .update(user)
      .set({
        isActive: false,
        isSignedIn: false,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id));

    sendSuccessResponse(response, 200, 'User account deactivated successfully', null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DEACTIVATE_USER');
    sendErrorResponse(response, 500, 'Failed to deactivate user account. Please try again.');
  }
};

export default deactivateUser;
