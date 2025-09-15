import db, { insertTokenBlacklistSchema, tokenBlacklist, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const logout: RequestHandler = async (request, response) => {
  try {
    const userId = request.user?.id;
    const { token } = request;

    if (!userId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    if (!token) {
      sendErrorResponse(response, 400, 'Token is required');
      return;
    }

    // Create token expiry date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const tokenData = insertTokenBlacklistSchema.parse({
      token,
      expiresAt,
    });

    await db.transaction(async (tx) => {
      // Update user signed-in status
      await tx
        .update(user)
        .set({ isSignedIn: false, updatedAt: new Date() })
        .where(eq(user.id, userId));

      // Blacklist the token
      await tx.insert(tokenBlacklist).values(tokenData);
    });

    sendSuccessResponse(response, 200, 'Logged out successfully', null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }
    logError(error, 'LOGOUT');
    sendErrorResponse(response, 500, `Logout failed: ${(error as Error).message}`);
  }
};

export default logout;
