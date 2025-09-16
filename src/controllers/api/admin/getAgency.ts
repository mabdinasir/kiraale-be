import db, { agency, agencyAgent, user } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { getAgencyByIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const adminGetAgency: RequestHandler = async (request, response) => {
  try {
    const validatedParams = getAgencyByIdSchema.parse(request.params);
    const { id } = validatedParams;

    // Get agency details with creator info (admin view)
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
          mobile: user.mobile,
          agentNumber: user.agentNumber,
          role: user.role,
        },
      })
      .from(agency)
      .leftJoin(user, eq(agency.createdById, user.id))
      .where(eq(agency.id, id));

    if (!agencyData) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Get all agents with full admin details including roles
    const agents = await db
      .select({
        id: agencyAgent.id,
        role: agencyAgent.role, // Include role for admin view
        isActive: agencyAgent.isActive,
        joinedAt: agencyAgent.joinedAt,
        leftAt: agencyAgent.leftAt,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          agentNumber: user.agentNumber,
          isActive: user.isActive,
          createdAt: user.createdAt,
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
          stats: {
            totalAgents: agents.length,
            activeAgents: agents.filter((agent) => agent.isActive).length,
            inactiveAgents: agents.filter((agent) => !agent.isActive).length,
            adminAgents: agents.filter((agent) => agent.role === 'AGENCY_ADMIN').length,
            regularAgents: agents.filter((agent) => agent.role === 'AGENT').length,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADMIN_GET_AGENCY');
    sendErrorResponse(response, 500, `Failed to retrieve agency: ${(error as Error).message}`);
  }
};

export default adminGetAgency;
