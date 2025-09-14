import db from '@db/index';
import { user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { omitPassword } from '@lib/utils/security/omitPassword';
import { adminUpdateUserParamsSchema, adminUpdateUserSchema } from '@schemas/user.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const adminUpdateUser: RequestHandler = async (request, response) => {
  try {
    // Validate params
    const paramsValidation = adminUpdateUserParamsSchema.safeParse(request.params);
    if (!paramsValidation.success) {
      handleValidationError(paramsValidation.error, response);
      return;
    }

    // Validate body
    const bodyValidation = adminUpdateUserSchema.safeParse(request.body);
    if (!bodyValidation.success) {
      handleValidationError(bodyValidation.error, response);
      return;
    }

    const { id: userId } = paramsValidation.data;
    const updateData = bodyValidation.data;

    // Check if user exists
    const [existingUser] = await db
      .select({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isDeleted: user.isDeleted,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (!existingUser) {
      sendErrorResponse(response, 404, 'User not found');
      return;
    }

    if (existingUser.isDeleted) {
      sendErrorResponse(response, 400, 'Cannot update deleted user');
      return;
    }

    // Prevent demoting the last admin
    if (updateData.role && updateData.role !== 'ADMIN' && existingUser.role === 'ADMIN') {
      const [adminCount] = await db
        .select({ count: db.$count(user, eq(user.role, 'ADMIN')) })
        .from(user);

      if (adminCount.count <= 1) {
        sendErrorResponse(response, 400, 'Cannot demote the last admin user');
        return;
      }
    }

    // Check for email/mobile uniqueness if they're being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const [emailExists] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, updateData.email))
        .limit(1);

      if (emailExists) {
        sendErrorResponse(response, 409, 'Email already exists');
        return;
      }
    }

    if (updateData.mobile) {
      const [mobileExists] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.mobile, updateData.mobile))
        .limit(1);

      if (mobileExists && mobileExists.id !== userId) {
        sendErrorResponse(response, 409, 'Mobile number already exists');
        return;
      }
    }

    // Update user
    await db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Get updated user data
    const [updatedUser] = await db.select().from(user).where(eq(user.id, userId));

    const userWithoutPassword = omitPassword(updatedUser);

    sendSuccessResponse(
      response,
      200,
      `User ${existingUser.firstName} ${existingUser.lastName} updated successfully`,
      {
        user: userWithoutPassword,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADMIN_UPDATE_USER');
    sendErrorResponse(response, 500, 'Failed to update user.');
  }
};

export default adminUpdateUser;
