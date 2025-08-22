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
      response.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }

    // Validate authorization header structure
    const authorizationHeader = authorizationSchema.parse(request.headers.authorization);
    const [, token] = authorizationHeader.split(' ') as [string, string];

    if (!token || token === '') {
      response.status(401).json({ success: false, message: 'Authorization token missing' });
      return;
    }

    // Verify token validity
    const decoded = verifyJwtToken(token);

    // Check token blacklist first (most critical)
    const blacklistedToken = await checkTokenBlacklist(token);
    if (blacklistedToken) {
      response
        .status(401)
        .json({ success: false, message: 'Token used has been revoked! Please sign in first!' });
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
      response.status(401).json({
        success: false,
        message: 'User account not found',
      });
      return;
    }

    if (!currentUser.isSignedIn) {
      response.status(401).json({
        success: false,
        message: 'Session ended. Please sign in again.',
      });
      return;
    }

    if (!currentUser.isActive) {
      response.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
      return;
    }

    if (currentUser.isDeleted) {
      response.status(401).json({
        success: false,
        message: 'Account no longer exists',
      });
      return;
    }

    // Attach user context to request
    request.user = decoded;
    request.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      response.status(401).json({ success: false, message: 'Session expired' });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({ success: false, message: 'Invalid session' });
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
