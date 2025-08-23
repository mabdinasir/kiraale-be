import db from '@db/index';
import { tokenBlacklist, user } from '@db/schemas';
import { verifyJwtToken } from '@lib/utils/auth/generateJwtToken';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { authorizationSchema } from 'schemas';
import { z } from 'zod';

dotenv.config();

const checkTokenBlacklist = async (token: string) => {
  const result = await db
    .select()
    .from(tokenBlacklist)
    .where(eq(tokenBlacklist.token, token))
    .limit(1);
  return result[0];
};

export const authMiddleware: RequestHandler = async (request, response, next) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || jwtSecret === '') {
      sendErrorResponse(response, 500, 'Server configuration error');
      return;
    }

    // Validate authorization header structure
    const authorizationHeader = authorizationSchema.parse(request.headers.authorization);
    const [, token] = authorizationHeader.split(' ') as [string, string];

    if (!token || token === '') {
      sendErrorResponse(response, 401, 'Authorization token missing');
      return;
    }

    // Verify token validity
    const decoded = verifyJwtToken(token);

    // Check token blacklist first (most critical)
    const blacklistedToken = await checkTokenBlacklist(token);
    if (blacklistedToken) {
      sendErrorResponse(response, 401, 'Token used has been revoked! Please sign in first!');
      return;
    }

    // Verify user status in database (essential security check)
    const [currentUser] = await db
      .select({
        isSignedIn: user.isSignedIn,
        isActive: user.isActive,
        isDeleted: user.isDeleted,
      })
      .from(user)
      .where(eq(user.id, decoded.id))
      .limit(1);

    if (!currentUser) {
      sendErrorResponse(response, 401, 'User account not found');
      return;
    }

    if (!currentUser.isSignedIn) {
      sendErrorResponse(response, 401, 'Session ended. Please sign in again.');
      return;
    }

    if (!currentUser.isActive) {
      sendErrorResponse(response, 401, 'Account has been deactivated');
      return;
    }

    if (currentUser.isDeleted) {
      sendErrorResponse(response, 401, 'Account no longer exists');
      return;
    }

    // Attach user context to request
    request.user = decoded;
    request.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendErrorResponse(response, 401, 'Session expired');
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      sendErrorResponse(response, 401, 'Invalid session');
      return;
    }

    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'AUTH_MIDDLEWARE');
    sendErrorResponse(response, 500, 'Authentication failed. Please try again.');
  }
};
