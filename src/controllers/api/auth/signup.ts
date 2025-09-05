import db from '@db/index';
import { user } from '@db/schemas';
import { generateJwtToken, generateRefreshToken } from '@lib/utils/auth/generateJwtToken';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { hashPassword } from '@lib/utils/security/hashPassword';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { signUpSchema } from '@schemas';
import { eq, or } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const signUp: RequestHandler = async (request, response) => {
  try {
    // Validate request body with simple schema
    const userData = await signUpSchema.parseAsync(request.body);

    // Check for existing user by email or mobile
    const [existingUser] = await db
      .select()
      .from(user)
      .where(or(eq(user.email, userData.email), eq(user.mobile, userData.mobile)));

    if (existingUser) {
      if (existingUser.email === userData.email) {
        sendErrorResponse(response, 409, 'An account with this email already exists!');
        return;
      }
      if (existingUser.mobile === userData.mobile) {
        sendErrorResponse(response, 409, 'An account with this phone number already exists!');
        return;
      }
    }
    // Hash password and create user
    const hashedPassword = await hashPassword(userData.password);

    const [createdUser] = await db
      .insert(user)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    // Generate tokens and remove password from response
    const accessToken = generateJwtToken(createdUser);
    const refreshToken = generateRefreshToken(createdUser.id);
    const userWithoutPassword = omitPassword(createdUser);

    sendSuccessResponse(response, 201, 'User created successfully!', {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'SIGNUP');
    sendErrorResponse(response, 500, `Internal error occurred: ${(error as Error).message}`);
  }
};

export default signUp;
