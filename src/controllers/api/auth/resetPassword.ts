import db from '@db/index';
import { resetToken as resetTokenTable, user as userTable } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { hashPassword } from '@lib/utils/security/hashPassword';
import { isTokenExpired } from '@lib/utils/security/secureTokens';
import { resetPasswordSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const resetPassword: RequestHandler = async (request, response) => {
  const validationResult = resetPasswordSchema.safeParse(request.body);

  if (!validationResult.success) {
    handleValidationError(validationResult.error, response);
    return;
  }

  const { token, newPassword } = validationResult.data;

  try {
    // Find the reset token in database
    const [resetToken] = await db
      .select({
        id: resetTokenTable.id,
        userId: resetTokenTable.userId,
        token: resetTokenTable.token,
        expiresAt: resetTokenTable.expiresAt,
        user: userTable,
      })
      .from(resetTokenTable)
      .innerJoin(userTable, eq(resetTokenTable.userId, userTable.id))
      .where(eq(resetTokenTable.token, token));

    // Check if token exists and is not expired
    if (!resetToken) {
      sendErrorResponse(response, 400, 'Invalid reset token');
      return;
    }

    if (isTokenExpired(resetToken.expiresAt)) {
      // Clean up expired token
      await db.delete(resetTokenTable).where(eq(resetTokenTable.id, resetToken.id));
      sendErrorResponse(
        response,
        400,
        'Reset token has expired. Please request a new password reset.',
      );
      return;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    await db
      .update(userTable)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, resetToken.userId));

    // Delete all reset tokens belonging to the user
    await db.delete(resetTokenTable).where(eq(resetTokenTable.userId, resetToken.userId));

    response.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logError(error, 'RESET_PASSWORD');
    sendErrorResponse(response, 500, 'Failed to reset password. Please try again.');
  }
};

export default resetPassword;
