import db from '@db/index';
import { insertTokenBlacklistSchema, tokenBlacklist, user } from '@db/schemas';
import { handleValidationError, logError } from '@lib/utils/error/errorHandler';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const logout: RequestHandler = async (request, response) => {
  try {
    const tokenData = insertTokenBlacklistSchema.parse({
      token: request?.token ?? '',
    });

    await db.transaction(async (tx) => {
      // Update user signed-in status
      await tx
        .update(user)
        .set({ isSignedIn: false, updatedAt: new Date() })
        .where(eq(user.id, request?.user?.id ?? ''));

      // Blacklist the token
      await tx.insert(tokenBlacklist).values(tokenData);
    });

    response.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }
    logError(error, 'LOGOUT');
    response
      .status(500)
      .json({ success: false, message: `Logout failed: ${(error as Error).message}` });
  }
};

export default logout;
