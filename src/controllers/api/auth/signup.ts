import db from '@db/index';
import { user } from '@db/schemas';
import { handleValidationError, logError } from '@lib/utils/error/errorHandler';
import { hashPassword } from '@lib/utils/security/hashPassword';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { signUpSchema } from '@schemas/index';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const signUp: RequestHandler = async (request, response) => {
  try {
    // Validate request body with simple schema
    const userData = await signUpSchema.parseAsync(request.body);

    // Check for existing user
    const [existingUser] = await db.select().from(user).where(eq(user.email, userData.email));
    if (existingUser) {
      response.status(409).json({ success: false, message: 'User already exists!' });
      return;
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

    // Remove password from response
    const userWithoutPassword = omitPassword(createdUser);

    response.status(201).json({
      success: true,
      message: 'User created successfully!',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'SIGNUP');
    response.status(500).json({
      success: false,
      message: `Internal error occurred: ${(error as Error).message}`,
    });
  }
};

export default signUp;
