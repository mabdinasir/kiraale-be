import db, { contact } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getContactParamsSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { z } from 'zod';

export default async function getContact(request: Request, response: Response) {
  try {
    const { id } = getContactParamsSchema.parse(request.params);

    const contactData = await db.query.contact.findFirst({
      where: eq(contact.id, id),
      with: {
        resolvedBy: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
          },
        },
      },
    });

    if (!contactData) {
      sendErrorResponse(response, 404, 'Contact not found');
      return;
    }

    sendSuccessResponse(response, 200, 'Contact retrieved successfully', {
      contact: contactData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_CONTACT');
    sendErrorResponse(response, 500, `Failed to get contact: ${(error as Error).message}`);
  }
}
