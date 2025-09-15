import db, { user } from '@db';
import {
  accountSuspensionTemplate,
  handleValidationError,
  logError,
  sendEmail,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
import { adminSuspendUserBodySchema, adminSuspendUserSchema } from '@schemas';
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

    // Send suspension email to user (only when suspending, not unsuspending)
    if (isSuspended && suspensionReason) {
      try {
        const template = accountSuspensionTemplate(
          `${existingUser.firstName} ${existingUser.lastName}`,
          existingUser.email,
          suspensionReason,
        );
        await sendEmail(
          `"Kiraale Support" <${process.env.NODE_MAILER_EMAIL}>`,
          existingUser.email,
          template.subject,
          template.text,
          template.html,
        );
      } catch (emailError) {
        logError(emailError, 'ADMIN_SUSPEND_USER_EMAIL');
      }
    }

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
