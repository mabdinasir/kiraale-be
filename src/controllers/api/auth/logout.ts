import db from '@db/index';
import { insertTokenBlacklistSchema, tokenBlacklist, user } from '@db/schemas';
import { handleValidationError, logError } from '@lib/utils/error/errorHandler';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const logout: RequestHandler = async (request, response) => {
  try {
    const userId = request.user?.id;
    const { token } = request;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!token) {
      response.status(400).json({
        success: false,
        message: 'Token is required',
      });
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

    response.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }
    logError(error, 'LOGOUT');
    response.status(500).json({
      success: false,
      message: `Logout failed: ${(error as Error).message}`,
    });
  }
};

export default logout;
