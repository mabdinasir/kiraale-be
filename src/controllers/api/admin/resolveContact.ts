import db, { contact } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { resolveContactSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const resolveContact: RequestHandler = async (request, response) => {
  try {
    // Validate contact ID from params
    const paramsValidation = z.object({ contactId: z.uuid() }).safeParse(request.params);
    if (!paramsValidation.success) {
      handleValidationError(paramsValidation.error, response);
      return;
    }

    // Validate request body
    const bodyValidation = resolveContactSchema.safeParse(request.body);
    if (!bodyValidation.success) {
      handleValidationError(bodyValidation.error, response);
      return;
    }

    const { contactId } = paramsValidation.data;
    const { adminNotes } = bodyValidation.data;

    // Get admin user ID from authenticated request
    const adminId = request.user?.id;
    if (!adminId) {
      sendErrorResponse(response, 401, 'Unauthorized');
      return;
    }

    // Check if contact exists
    const [existingContact] = await db
      .select({
        id: contact.id,
        isResolved: contact.isResolved,
      })
      .from(contact)
      .where(eq(contact.id, contactId));

    if (!existingContact) {
      sendErrorResponse(response, 404, 'Contact message not found');
      return;
    }

    if (existingContact.isResolved) {
      sendErrorResponse(response, 400, 'Contact message is already resolved');
      return;
    }

    // Update contact to resolved
    const [updatedContact] = await db
      .update(contact)
      .set({
        isResolved: true,
        resolvedById: adminId,
        resolvedAt: new Date(),
        adminNotes,
      })
      .where(eq(contact.id, contactId))
      .returning();

    sendSuccessResponse(response, 200, 'Contact message resolved successfully', {
      contact: updatedContact,
    });
  } catch (error) {
    logError(error, 'ADMIN_RESOLVE_CONTACT');
    sendErrorResponse(response, 500, 'Failed to resolve contact message.');
  }
};

export default resolveContact;
