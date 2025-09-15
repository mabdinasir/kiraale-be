import db, { user } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { deleteParamsSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteUser: RequestHandler = async (request, response) => {
  const userId = request.user?.id;

  const { id } = deleteParamsSchema.parse({ id: userId });

  try {
    // Check if user exists and is not already deleted
    const [existingUser] = await db.select().from(user).where(eq(user.id, id));

    if (!existingUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    // Delete for real
    await db.delete(user).where(eq(user.id, id));

    response.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_USER');
    sendErrorResponse(response, 500, 'Failed to delete user account. Please try again.');
  }
};

export default deleteUser;
