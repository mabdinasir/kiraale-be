import db from '@db/index';
import { user } from '@db/schemas';
import { logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const getUsers: RequestHandler = async (request, response) => {
  try {
    // Permission checks are now handled by middleware
    const users = await db.select().from(user).where(eq(user.isDeleted, false));

    const usersWithoutPasswords = users.map(omitPassword);

    response.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: usersWithoutPasswords,
      },
    });
  } catch (error) {
    logError(error, 'GET_USERS');
    sendErrorResponse(response, 500, 'Failed to retrieve users.');
  }
};

export default getUsers;
