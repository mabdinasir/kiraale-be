import db from '@db/index';
import { agency } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { createAgencySchema } from '@schemas/agency.schema';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createAgency: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const validatedData = createAgencySchema.parse(request.body);

    const [newAgency] = await db
      .insert(agency)
      .values({
        name: validatedData.name,
        description: validatedData.description,
        country: validatedData.country,
        address: validatedData.address,
        phone: validatedData.phone,
        email: validatedData.email,
        website: validatedData.website,
        licenseNumber: validatedData.licenseNumber,
        createdById: requestingUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    response.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: {
        agency: newAgency,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_AGENCY');
    sendErrorResponse(response, 500, `Agency creation failed: ${(error as Error).message}`);
  }
};

export default createAgency;
