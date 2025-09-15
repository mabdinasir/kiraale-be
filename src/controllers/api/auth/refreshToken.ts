import db, { tokenBlacklist, user } from '@db';
import {
  generateJwtToken,
  generateRefreshToken,
  handleValidationError,
  logError,
  omitPassword,
  sendErrorResponse,
  sendSuccessResponse,
  verifyRefreshToken,
} from '@lib';
import { refreshTokenSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const refreshToken: RequestHandler = async (request, response) => {
  try {
    // Validate request body with Zod
    const { refreshToken: token } = await refreshTokenSchema.parseAsync(request.body);

    // Check if refresh token is blacklisted
    const [blacklistedToken] = await db
      .select()
      .from(tokenBlacklist)
      .where(eq(tokenBlacklist.token, token))
      .limit(1);

    if (blacklistedToken) {
      sendErrorResponse(response, 401, 'Refresh token has been revoked');
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    if (decoded.type !== 'refresh') {
      sendErrorResponse(response, 401, 'Invalid token type');
      return;
    }

    // Get user data
    const [existingUser] = await db.select().from(user).where(eq(user.id, decoded.userId)).limit(1);

    if (!existingUser || existingUser.isDeleted || !existingUser.isActive) {
      sendErrorResponse(response, 404, 'User not found or inactive');
      return;
    }

    // Generate new tokens
    const newAccessToken = generateJwtToken(existingUser);
    const newRefreshToken = generateRefreshToken(existingUser.id);
    const userWithoutPassword = omitPassword(existingUser);

    // Blacklist the old refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60); // 60 days from now

    await db.insert(tokenBlacklist).values({
      token,
      expiresAt,
    });

    sendSuccessResponse(response, 200, 'Token refreshed successfully', {
      user: userWithoutPassword,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendErrorResponse(response, 401, 'Refresh token expired');
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      sendErrorResponse(response, 401, 'Invalid refresh token');
      return;
    }

    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'REFRESH_TOKEN');
    sendErrorResponse(response, 500, `Internal error occurred: ${(error as Error).message}`);
  }
};

export default refreshToken;
