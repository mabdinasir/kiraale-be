import db from '@db/index';
import { property, user } from '@db/schemas';
import { propertyApprovedTemplate } from '@lib/emailTemplates';
import { sendEmail } from '@lib/utils/email/nodeMailer';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { approvePropertyBodySchema, approvePropertyParamsSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const approveProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = approvePropertyParamsSchema.parse(request.params);
    const { adminNotes } = approvePropertyBodySchema.parse(request.body);
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
      .where(and(eq(property.id, id), eq(property.status, 'PENDING')));

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

    // Approve property with race condition protection
    const [approvedProperty] = await db
      .update(property)
      .set({
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminUserId,
        adminNotes: adminNotes ?? null,
        rejectionReason: null, // Clear any previous rejection reason
        updatedAt: new Date(),
      })
      .where(and(eq(property.id, id), eq(property.status, 'PENDING'))) // Race condition protection
      .returning();

    // Verify the update was successful (property was actually pending)
    if (!approvedProperty) {
      sendErrorResponse(
        response,
        409,
        'Property is no longer in pending status - may have been processed by another admin',
      );
      return;
    }

    // Send approval email to property owner
    try {
      const emailTemplate = propertyApprovedTemplate(
        existingPropertyWithOwner.property.title,
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

      // Log successful approval action
      logError(
        `Property ${id} approved by admin ${adminUserId}${adminNotes ? `. Notes: ${adminNotes}` : ''}`,
        'PROPERTY_APPROVED_AUDIT',
      );
    } catch (emailError) {
      logError(emailError, 'APPROVE_PROPERTY_EMAIL');
      // Email failed but property was approved - log this but don't fail the request
      logError(
        `Property ${id} approved but email notification failed for user ${existingPropertyWithOwner.owner.email}`,
        'EMAIL_NOTIFICATION_FAILED',
      );
    }

    response.status(200).json({
      success: true,
      message: 'Property approved successfully',
      data: {
        property: approvedProperty,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'APPROVE_PROPERTY');
    sendErrorResponse(response, 500, 'Failed to approve property.');
  }
};

export default approveProperty;
