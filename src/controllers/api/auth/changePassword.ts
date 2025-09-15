import db, { user } from '@db';
import {
  handleValidationError,
  hashPassword,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
  verifyPassword,
} from '@lib';
import { changePasswordSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const changePassword: RequestHandler = async (request, response) => {
  const userId = request.user?.id;

  if (!userId) {
    sendErrorResponse(response, 401, 'Unauthorized');
    return;
  }

  const validationResult = changePasswordSchema.safeParse(request.body);

  if (!validationResult.success) {
    handleValidationError(validationResult.error, response);
    return;
  }

  const { currentPassword, newPassword } = validationResult.data;

  try {
    // Get the current user
    const [existingUser] = await db.select().from(user).where(eq(user.id, userId));

    if (!existingUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, existingUser.password);
    if (!isValidPassword) {
      sendErrorResponse(response, 400, 'Current password is incorrect');
      return;
    }

    // Check if new password is the same as current password
    const isSamePassword = await verifyPassword(newPassword, existingUser.password);
    if (isSamePassword) {
      sendErrorResponse(response, 400, 'New password must be different from current password');
      return;
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update user's password
    await db
      .update(user)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    sendSuccessResponse(response, 200, 'Password changed successfully', null);
  } catch (error) {
    logError(error, 'CHANGE_PASSWORD');
    sendErrorResponse(response, 500, 'Failed to change password. Please try again.');
  }
};

export default changePassword;
