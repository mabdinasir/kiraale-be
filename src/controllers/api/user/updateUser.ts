import db from '@db/index';
import { user } from '@db/schemas';
import { adminPermissions, canModifyResource } from '@lib/permissions';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { getUserByIdSchema, updateUserSchema } from '@schemas/index';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateUser: RequestHandler = async (request, response) => {
  try {
    const { id } = getUserByIdSchema.parse(request.params);
    const updateData = updateUserSchema.parse(request.body);

    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    // Check if user exists
    const [existingUser] = await db.select().from(user).where(eq(user.id, id));
    if (!existingUser) {
      response.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check if user can modify this resource
    const canModify =
      canModifyResource(
        requestingUserRole,
        requestingUserId,
        existingUser.id,
        existingUser.role,
        'USER_WRITE',
      ) ?? adminPermissions.canAccess(requestingUserRole);

    if (!canModify) {
      sendErrorResponse(response, 403, 'Access denied. You can only update your own profile.');
      return;
    }

    // Update user
    await db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id));

    // Fetch the updated user
    const [updatedUser] = await db.select().from(user).where(eq(user.id, id));
    const userWithoutPassword = omitPassword(updatedUser);

    response.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_USER');
    sendErrorResponse(response, 500, 'Failed to update user.');
  }
};

export default updateUser;
