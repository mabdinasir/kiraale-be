import db from '@db/index';
import { user } from '@db/schemas';
import { adminPermissions, canAccessResource } from '@lib/permissions';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { getUserByIdSchema } from '@schemas/index';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getUser: RequestHandler = async (request, response) => {
  try {
    const { id } = getUserByIdSchema.parse(request.params);
    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const [existingUser] = await db.select().from(user).where(eq(user.id, id));

    if (!existingUser) {
      response.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check if user can access this resource
    const canAccess =
      canAccessResource(requestingUserRole, requestingUserId, existingUser.id, 'USER_READ') ||
      adminPermissions.canAccess(requestingUserRole);

    if (!canAccess) {
      sendErrorResponse(response, 403, 'Access denied. You can only access your own profile.');
      return;
    }

    const userWithoutPassword = omitPassword(existingUser);

    response.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: userWithoutPassword,
      },
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
