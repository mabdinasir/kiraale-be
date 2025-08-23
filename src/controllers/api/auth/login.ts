import db from '@db/index';
import { user } from '@db/schemas';
import { generateJwtToken, generateRefreshToken } from '@lib/utils/auth/generateJwtToken';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { verifyPassword } from '@lib/utils/security/hashPassword';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { loginSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const login: RequestHandler = async (request, response) => {
  try {
    // Validate request body with Zod
    const userData = await loginSchema.parseAsync(request.body);

    const [existingUser] = await db.select().from(user).where(eq(user.email, userData.email));
    if (!existingUser) {
      sendErrorResponse(response, 404, 'Sorry, user not found!');
      return;
    }

    // Verify password
    const isValidPassword = await verifyPassword(userData.password, existingUser?.password ?? '');
    if (!isValidPassword) {
      sendErrorResponse(response, 401, 'Invalid email or password');
      return;
    }

    // Update user status
    await db
      .update(user)
      .set({
        isSignedIn: true,
        isDeleted: false,
        updatedAt: new Date(),
      })
      .where(eq(user.id, existingUser.id));

    // Fetch updated user
    const [loggedInUser] = await db.select().from(user).where(eq(user.id, existingUser.id));

    // Generate tokens and remove password from response
    const accessToken = generateJwtToken(loggedInUser);
    const refreshToken = generateRefreshToken(loggedInUser.id);
    const userWithoutPassword = omitPassword(loggedInUser);

    response.status(200).json({
      success: true,
      message: 'User signed in successfully!',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'LOGIN');
    sendErrorResponse(response, 500, `Internal error occurred: ${(error as Error).message}`);
  }
};

export default login;
