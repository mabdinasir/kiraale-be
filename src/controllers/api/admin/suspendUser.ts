import db from '@db/index';
import { user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { adminSuspendUserBodySchema, adminSuspendUserSchema } from '@schemas/admin.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const suspendUser: RequestHandler = async (request, response) => {
  try {
    const paramsValidation = adminSuspendUserSchema.safeParse(request.params);
    if (!paramsValidation.success) {
      handleValidationError(paramsValidation.error, response);
      return;
    }

    const bodyValidation = adminSuspendUserBodySchema.safeParse(request.body);
    if (!bodyValidation.success) {
      handleValidationError(bodyValidation.error, response);
      return;
    }

    const { userId } = paramsValidation.data;
    const { isSuspended, suspensionReason } = bodyValidation.data;

    // Check if user exists and is not deleted
    const [existingUser] = await db
      .select({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isDeleted: user.isDeleted,
        isSuspended: user.isSuspended,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (!existingUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    if (existingUser.isDeleted) {
      sendErrorResponse(response, 400, 'Cannot modify deleted user');
      return;
    }

    // Prevent admins from suspending other admins
    if (existingUser.role === 'ADMIN') {
      sendErrorResponse(response, 403, 'Cannot suspend admin users');
      return;
    }

    // Check if user is already in the requested state
    if (existingUser.isSuspended === isSuspended) {
      const action = isSuspended ? 'suspended' : 'active';
      sendErrorResponse(response, 400, `User is already ${action}`);
      return;
    }

    // Update user suspension status
    await db
      .update(user)
      .set({
        isSuspended,
        suspensionReason: isSuspended ? suspensionReason : null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    const action = isSuspended ? 'suspended' : 'unsuspended';
    const message = `User ${existingUser.firstName} ${existingUser.lastName} has been ${action} successfully`;

    sendSuccessResponse(response, 200, message, {
      userId,
      email: existingUser.email,
      isSuspended,
      suspensionReason,
      updatedAt: new Date(),
    });
  } catch (error) {
    logError(error, 'ADMIN_SUSPEND_USER');
    sendErrorResponse(response, 500, 'Failed to update user suspension status.');
  }
};

export default suspendUser;
