import db, { contact } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { createContactSchema } from '@schemas';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createContact: RequestHandler = async (request, response) => {
  try {
    const contactData = await createContactSchema.parseAsync(request.body);

    const [createdContact] = await db.insert(contact).values(contactData).returning();

    sendSuccessResponse(response, 201, 'Contact form submitted successfully!', {
      contact: createdContact,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_CONTACT');
    sendErrorResponse(response, 500, `Failed to submit contact form: ${(error as Error).message}`);
  }
};

export default createContact;
