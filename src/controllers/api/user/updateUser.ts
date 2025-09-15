import db, { user } from '@db';
import {
  handleValidationError,
  logError,
  omitPassword,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
import { getUserByIdSchema, updateUserSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateUser: RequestHandler = async (request, response) => {
  try {
    const { id } = getUserByIdSchema.parse(request.params);
    const updateData = updateUserSchema.parse(request.body);

    // Check if user exists
    const [existingUser] = await db.select().from(user).where(eq(user.id, id));
    if (!existingUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    // Permission checks are now handled by middleware
    // Update user
    await db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id));

    // Fetch the updated user
    const [updatedUser] = await db.select().from(user).where(eq(user.id, id));
    const userWithoutPassword = omitPassword(updatedUser);

    sendSuccessResponse(response, 200, 'User updated successfully', {
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_USER');
    sendErrorResponse(response, 500, 'Failed to update user.');
  }
};

export default updateUser;
