import db from '@db/index';
import { property, user } from '@db/schemas';
import { propertyRejectedTemplate } from '@lib/emailTemplates';
import { sendEmail } from '@lib/utils/email/nodeMailer';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { rejectPropertyBodySchema, rejectPropertyParamsSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const rejectProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = rejectPropertyParamsSchema.parse(request.params);
    const { rejectionReason, adminNotes } = rejectPropertyBodySchema.parse(request.body);
    const adminUserId = request.user?.id;

    if (!adminUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    // Check if property exists and is pending, with owner details
    const [existingPropertyWithOwner] = await db
      .select({
        property,
        owner: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(eq(property.id, id));

    if (!existingPropertyWithOwner) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    if (existingPropertyWithOwner.property.status !== 'PENDING') {
      sendErrorResponse(response, 400, 'Property is not in pending status');
      return;
    }

    // Check email configuration before updating property
    if (!process.env.NODE_MAILER_EMAIL) {
      sendErrorResponse(
        response,
        500,
        'Email service not configured - cannot notify property owner',
      );
      return;
    }

    // Reject property with race condition protection
    const [rejectedProperty] = await db
      .update(property)
      .set({
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminUserId,
        rejectionReason,
        adminNotes: adminNotes ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(property.id, id), eq(property.status, 'PENDING'))) // Race condition protection
      .returning();

    // Verify the update was successful (property was actually pending)
    if (!rejectedProperty) {
      sendErrorResponse(
        response,
        409,
        'Property is no longer in pending status - may have been processed by another admin',
      );
      return;
    }

    // Send rejection email to property owner
    try {
      const emailTemplate = propertyRejectedTemplate(
        existingPropertyWithOwner.property.title,
        rejectionReason,
        `${existingPropertyWithOwner.owner.firstName} ${existingPropertyWithOwner.owner.lastName}`,
        adminNotes,
      );

      await sendEmail(
        process.env.NODE_MAILER_EMAIL,
        existingPropertyWithOwner.owner.email,
        emailTemplate.subject,
        emailTemplate.text,
        emailTemplate.html,
      );

      // Log successful rejection action
      logError(
        `Property ${id} rejected by admin ${adminUserId}. Reason: ${rejectionReason}`,
        'PROPERTY_REJECTED_AUDIT',
      );
    } catch (emailError) {
      logError(emailError, 'REJECT_PROPERTY_EMAIL');
      // Email failed but property was rejected - log this but don't fail the request
      logError(
        `Property ${id} rejected but email notification failed for user ${existingPropertyWithOwner.owner.email}`,
        'EMAIL_NOTIFICATION_FAILED',
      );
    }

    response.status(200).json({
      success: true,
      message: 'Property rejected successfully',
      data: {
        property: rejectedProperty,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'REJECT_PROPERTY');
    sendErrorResponse(response, 500, 'Failed to reject property.');
  }
};

export default rejectProperty;
