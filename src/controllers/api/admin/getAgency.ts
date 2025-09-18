import db, { agency, agencyAgent, property, user } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { getAgencyByIdSchema } from '@schemas';
import { and, eq, inArray, isNull } from 'drizzle-orm';
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
        isSuspended: agency.isSuspended,
        suspendedAt: agency.suspendedAt,
        suspendedBy: agency.suspendedBy,
        suspensionReason: agency.suspensionReason,
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
    const agentsData = await db
      .select({
        agencyAgentId: agencyAgent.id,
        role: agencyAgent.role,
        isActive: agencyAgent.isActive,
        joinedAt: agencyAgent.joinedAt,
        leftAt: agencyAgent.leftAt,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        userRole: user.role,
        agentNumber: user.agentNumber,
        isDeleted: user.isDeleted,
        isSuspended: user.isSuspended,
        suspensionReason: user.suspensionReason,
        profilePicture: user.profilePicture,
        bio: user.bio,
        address: user.address,
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

    // Get all properties for this agency's agents (including all statuses for admin)
    const allProperties =
      agentUserIds.length > 0
        ? await db
            .select({
              id: property.id,
              title: property.title,
              propertyType: property.propertyType,
              listingType: property.listingType,
              price: property.price,
              priceType: property.priceType,
              status: property.status,
              address: property.address,
              country: property.country,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              createdAt: property.createdAt,
              userId: property.userId,
            })
            .from(property)
            .where(and(inArray(property.userId, agentUserIds), isNull(property.deletedAt)))
            .orderBy(property.createdAt)
        : [];

    // Group agents with their properties
    const agents = agentsData.map((agent) => {
      const agentProperties = allProperties.filter((prop) => prop.userId === agent.userId);

      return {
        agencyAgentId: agent.agencyAgentId,
        role: agent.role,
        isActive: agent.isActive,
        joinedAt: agent.joinedAt,
        leftAt: agent.leftAt,
        user: {
          id: agent.userId,
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.email,
          mobile: agent.mobile,
          role: agent.userRole,
          agentNumber: agent.agentNumber,
          profilePicture: agent.profilePicture,
          bio: agent.bio,
          address: agent.address,
          isActive: agent.userIsActive,
          isDeleted: agent.isDeleted,
          isSuspended: agent.isSuspended,
          suspensionReason: agent.suspensionReason,
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
            adminAgents: agents.filter((agent) => agent.role === 'AGENCY_ADMIN').length,
            regularAgents: agents.filter((agent) => agent.role === 'AGENT').length,
            totalProperties: allProperties.length,
            availableProperties: allProperties.filter((prop) => prop.status === 'AVAILABLE').length,
            pendingProperties: allProperties.filter((prop) => prop.status === 'PENDING').length,
            rejectedProperties: allProperties.filter((prop) => prop.status === 'REJECTED').length,
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

    logError(error, 'ADMIN_GET_AGENCY');
    sendErrorResponse(response, 500, `Failed to retrieve agency: ${(error as Error).message}`);
  }
};

export default adminGetAgency;
