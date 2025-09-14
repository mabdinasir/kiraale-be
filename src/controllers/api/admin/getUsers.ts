import db from '@db/index';
import { user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { getUsersQuerySchema } from '@schemas/user.schema';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const getUsers: RequestHandler = async (request, response) => {
  try {
    // Validate query parameters
    const queryValidation = getUsersQuerySchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 50, role } = queryValidation.data ?? {};

    // Build query conditions
    const conditions = [eq(user.isDeleted, false)];
    if (role) {
      conditions.push(eq(user.role, role));
    }

    // Get users with pagination
    const users = await db
      .select()
      .from(user)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: user.id })
      .from(user)
      .where(and(...conditions));

    const totalUsers = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalUsers / limit);

    const usersWithoutPasswords = users.map(omitPassword);

    sendSuccessResponse(response, 200, 'Users retrieved successfully', {
      users: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    logError(error, 'ADMIN_GET_USERS');
    sendErrorResponse(response, 500, 'Failed to retrieve users.');
  }
};

export default getUsers;
