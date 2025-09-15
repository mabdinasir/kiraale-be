import db, { user } from '@db';
import {
  handleValidationError,
  logError,
  omitPassword,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
import { adminSearchUsersSchema } from '@schemas';
import { and, eq, ilike, or } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const searchUsers: RequestHandler = async (request, response) => {
  try {
    const queryValidation = adminSearchUsersSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 50, search, role, isActive, isSuspended } = queryValidation.data;

    // Build query conditions
    const conditions = [eq(user.isDeleted, false)];

    if (role) {
      conditions.push(eq(user.role, role));
    }

    if (isActive !== undefined) {
      conditions.push(eq(user.isActive, isActive));
    }

    if (isSuspended !== undefined) {
      conditions.push(eq(user.isSuspended, isSuspended));
    }

    if (search) {
      const searchCondition = or(
        ilike(user.firstName, `%${search}%`),
        ilike(user.lastName, `%${search}%`),
        ilike(user.email, `%${search}%`),
        ilike(user.mobile, `%${search}%`),
        ilike(user.agentNumber, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Get users with pagination
    const users = await db
      .select()
      .from(user)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(user.createdAt);

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
      filters: {
        search,
        role,
        isActive,
        isSuspended,
      },
    });
  } catch (error) {
    logError(error, 'ADMIN_SEARCH_USERS');
    sendErrorResponse(response, 500, 'Failed to search users.');
  }
};

export default searchUsers;
