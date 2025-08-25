import db from '@db/index';
import { user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { getUserByIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getUser: RequestHandler = async (request, response) => {
  try {
    const { id } = getUserByIdSchema.parse(request.params);

    const [existingUser] = await db.select().from(user).where(eq(user.id, id));

    if (!existingUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    // Permission checks are now handled by middleware
    const userWithoutPassword = omitPassword(existingUser);

    sendSuccessResponse(response, 200, 'User retrieved successfully', {
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_USER');
    sendErrorResponse(response, 500, 'Failed to retrieve user information.');
  }
};

export default getUser;
