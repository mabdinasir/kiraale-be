import db, { user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchUsersSchema } from '@schemas';
import { and, eq, ilike, or } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const agencySearchUser: RequestHandler = async (request, response) => {
  try {
    const queryValidation = searchUsersSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 20, search } = queryValidation.data;

    // Build query conditions - only show active, non-deleted, non-suspended users
    const conditions = [
      eq(user.isDeleted, false),
      eq(user.isActive, true),
      eq(user.isSuspended, false),
    ];

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

    // Get users with pagination - only select public fields
    const users = await db
      .select({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        agentNumber: user.agentNumber,
      })
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

    sendSuccessResponse(response, 200, 'Users retrieved successfully', {
      users,
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
      },
    });
  } catch (error) {
    logError(error, 'SEARCH_USERS');
    sendErrorResponse(response, 500, 'Failed to search users.');
  }
};

export default agencySearchUser;
