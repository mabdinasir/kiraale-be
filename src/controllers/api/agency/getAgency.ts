import db from '@db/index';
import { agency, agencyAgent, user } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { getAgencyByIdSchema } from '@schemas/agency.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getAgency: RequestHandler = async (request, response) => {
  try {
    const validatedParams = getAgencyByIdSchema.parse(request.params);
    const { id } = validatedParams;

    // Get agency details with creator info
    const [agencyData] = await db
      .select({
        id: agency.id,
        name: agency.name,
        description: agency.description,
        country: agency.country,
        address: agency.address,
        phone: agency.phone,
        email: agency.email,
        website: agency.website,
        licenseNumber: agency.licenseNumber,
        isActive: agency.isActive,
        createdAt: agency.createdAt,
        updatedAt: agency.updatedAt,
        createdBy: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })
      .from(agency)
      .leftJoin(user, eq(agency.createdById, user.id))
      .where(eq(agency.id, id));

    if (!agencyData) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Get active agents
    const agents = await db
      .select({
        id: agencyAgent.id,
        role: agencyAgent.role,
        isActive: agencyAgent.isActive,
        joinedAt: agencyAgent.joinedAt,
        leftAt: agencyAgent.leftAt,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
        },
      })
      .from(agencyAgent)
      .leftJoin(user, eq(agencyAgent.userId, user.id))
      .where(eq(agencyAgent.agencyId, id))
      .orderBy(agencyAgent.joinedAt);

    response.status(200).json({
      success: true,
      data: {
        agency: {
          ...agencyData,
          agents,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_AGENCY');
    sendErrorResponse(response, 500, `Failed to retrieve agency: ${(error as Error).message}`);
  }
};

export default getAgency;
