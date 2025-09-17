import db, { agency, agencyAgent, property, user } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { getAgencyByIdSchema } from '@schemas';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getAgency: RequestHandler = async (request, response) => {
  try {
    const validatedParams = getAgencyByIdSchema.parse(request.params);
    const { id } = validatedParams;

    // Get agency details with creator info (filter out suspended agencies)
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
        },
      })
      .from(agency)
      .leftJoin(user, eq(agency.createdById, user.id))
      .where(and(eq(agency.id, id), eq(agency.isSuspended, false)));

    if (!agencyData) {
      sendErrorResponse(response, 404, 'Agency not found');
      return;
    }

    // Get active agents (excluding role for public API)
    const agentsData = await db
      .select({
        agencyAgentId: agencyAgent.id,
        isActive: agencyAgent.isActive,
        joinedAt: agencyAgent.joinedAt,
        leftAt: agencyAgent.leftAt,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        agentNumber: user.agentNumber,
        profilePicture: user.profilePicture,
        bio: user.bio,
        userIsActive: user.isActive,
        userCreatedAt: user.createdAt,
      })
      .from(agencyAgent)
      .leftJoin(user, eq(agencyAgent.userId, user.id))
      .where(eq(agencyAgent.agencyId, id))
      .orderBy(agencyAgent.joinedAt);

    // Get agent user IDs for property queries
    const agentUserIds = agentsData
      .map((agent) => agent.userId)
      .filter((userId): userId is string => Boolean(userId));

    // Get properties for this agency's agents (approved only for public API)
    const allProperties =
      agentUserIds.length > 0
        ? await db
            .select({
              id: property.id,
              title: property.title,
              description: property.description,
              propertyType: property.propertyType,
              listingType: property.listingType,
              price: property.price,
              priceType: property.priceType,
              address: property.address,
              country: property.country,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              createdAt: property.createdAt,
              userId: property.userId,
            })
            .from(property)
            .where(
              and(
                inArray(property.userId, agentUserIds),
                eq(property.status, 'APPROVED'),
                isNull(property.deletedAt),
              ),
            )
            .orderBy(property.createdAt)
        : [];

    // Group agents with their properties
    const agents = agentsData.map((agent) => {
      const agentProperties = allProperties.filter((prop) => prop.userId === agent.userId);

      return {
        agencyAgentId: agent.agencyAgentId,
        isActive: agent.isActive,
        joinedAt: agent.joinedAt,
        leftAt: agent.leftAt,
        user: {
          id: agent.userId,
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.email,
          mobile: agent.mobile,
          agentNumber: agent.agentNumber,
          profilePicture: agent.profilePicture,
          bio: agent.bio,
          isActive: agent.userIsActive,
          createdAt: agent.userCreatedAt,
        },
        properties: agentProperties,
        propertyCount: agentProperties.length,
      };
    });

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
            totalProperties: allProperties.length,
            averagePropertyPrice:
              allProperties.length > 0
                ? Math.round(
                    allProperties.reduce((sum, prop) => sum + Number(prop.price), 0) /
                      allProperties.length,
                  )
                : 0,
            portfolioValue: allProperties
              .reduce((sum, prop) => sum + Number(prop.price), 0)
              .toString(),
            coverageAreas: [...new Set(allProperties.map((propertyItem) => propertyItem.country))]
              .length,
            mostCommonPropertyType:
              allProperties.length > 0
                ? allProperties.reduce<Record<string, number>>((acc, prop) => {
                    acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
                    return acc;
                  }, {})
                : {},
            recentActivity: {
              propertiesThisMonth: allProperties.filter((propertyItem) => {
                const propDate = new Date(propertyItem.createdAt);
                const now = new Date();
                return (
                  propDate.getMonth() === now.getMonth() &&
                  propDate.getFullYear() === now.getFullYear()
                );
              }).length,
              agentsJoinedThisMonth: agents.filter((agent) => {
                const joinDate = new Date(agent.joinedAt);
                const now = new Date();
                return (
                  joinDate.getMonth() === now.getMonth() &&
                  joinDate.getFullYear() === now.getFullYear()
                );
              }).length,
            },
          },
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
