import db from '@db/index';
import { insertResetTokenSchema, resetToken, user as userTable } from '@db/schemas';
import { resetPasswordTemplate } from '@lib/emailTemplates/resetPasswordTemplate';
import { sendEmail } from '@lib/utils/email/nodeMailer';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { generateExpiringToken } from '@lib/utils/security/secureTokens';
import { requestPasswordResetSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const requestPasswordReset: RequestHandler = async (req, res) => {
  const validationResult = requestPasswordResetSchema.safeParse(req.body);

  if (!validationResult.success) {
    handleValidationError(validationResult.error, res);
    return;
  }

  const { email } = validationResult.data;

  const [user] = await db.select().from(userTable).where(eq(userTable.email, email));

  // Respond success even if user doesn't exist to avoid leaking valid emails
  if (!user) {
    sendErrorResponse(res, 400, 'If the email exists, a reset link was sent.');
    return;
  }

  // Generate secure token that expires in 15 minutes
  const { token, expiresAt } = generateExpiringToken(15);

  try {
    const resetTokenData = insertResetTokenSchema.parse({
      userId: user.id,
      token,
      expiresAt,
    });

    await db.insert(resetToken).values(resetTokenData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, res);
      return;
    }
    logError(error, 'PASSWORD_RESET_TOKEN_CREATE');
    sendErrorResponse(res, 500, 'Failed to initiate password reset. Please try again.');
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL;
  const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

  try {
    const template = resetPasswordTemplate(resetUrl, `${user.firstName} ${user.lastName}`);
    await sendEmail(
      `"Kiraale Support" <${process.env.NODE_MAILER_EMAIL}>`,
      user.email,
      template.subject,
      template.text,
      template.html,
    );
  } catch (error) {
    logError(error, 'PASSWORD_RESET_EMAIL_SEND');
    // Don't reveal email sending failure to prevent email enumeration
  }
  sendErrorResponse(res, 200, 'If the email exists, a reset link was sent.');
};

export default requestPasswordReset;
