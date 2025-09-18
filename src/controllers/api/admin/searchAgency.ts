import db, { agency, agencyAgent, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { adminSearchAgencySchema } from '@schemas';
import { and, count, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const adminSearchAgency: RequestHandler = async (request, response) => {
  try {
    const { search, page, limit, includeAgents } = adminSearchAgencySchema.parse(request.query);

    const offset = (page - 1) * limit;

    // Build search conditions only if search term is provided
    const searchConditions = search?.trim()
      ? or(
          ilike(agency.id, `%${search.toLowerCase()}%`), // Can search by agency ID
          ilike(agency.name, `%${search.toLowerCase()}%`),
          ilike(agency.description, `%${search.toLowerCase()}%`),
          ilike(agency.address, `%${search.toLowerCase()}%`),
          ilike(agency.phone, `%${search.toLowerCase()}%`),
          ilike(agency.email, `%${search.toLowerCase()}%`),
          ilike(agency.website, `%${search.toLowerCase()}%`),
          ilike(agency.licenseNumber, `%${search.toLowerCase()}%`),
          ilike(agency.country, `%${search.toLowerCase()}%`),
        )
      : undefined;

    // Get agencies with creator info
    const agencies = await db
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
      .where(searchConditions ?? sql`true`)
      .limit(limit)
      .offset(offset)
      .orderBy(agency.name);

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(agency)
      .where(searchConditions ?? sql`true`);

    const totalPages = Math.ceil(totalCount / limit);

    // Get agents if requested
    let agenciesWithAgents = agencies;
    if (includeAgents && agencies.length > 0) {
      interface AgentWithUser {
        agencyId: string;
        id: string;
        role: string;
        isActive: boolean;
        joinedAt: Date;
        leftAt: Date | null;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          mobile: string | null;
          role: string;
          agentNumber: string | null;
        } | null;
      }
      const agentsByAgency: Record<string, AgentWithUser[]> = {};

      // Get all agents for all agencies in a single query
      const agencyIds = agencies.map((agencyItem) => agencyItem.id);
      const allAgents = await db
        .select({
          agencyId: agencyAgent.agencyId,
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
            role: user.role,
            agentNumber: user.agentNumber,
          },
        })
        .from(agencyAgent)
        .leftJoin(user, eq(agencyAgent.userId, user.id))
        .where(inArray(agencyAgent.agencyId, agencyIds))
        .orderBy(agencyAgent.joinedAt);

      // Group agents by agency ID
      allAgents.forEach((agent) => {
        if (!agentsByAgency[agent.agencyId]) {
          agentsByAgency[agent.agencyId] = [];
        }
        agentsByAgency[agent.agencyId].push(agent);
      });

      agenciesWithAgents = agencies.map((agencyItem) => ({
        ...agencyItem,
        agents: agentsByAgency[agencyItem.id] || [],
      }));
    }

    // Get agent counts for each agency
    const agencyIds = agencies.map((agencyItem) => agencyItem.id);
    const agentCounts: Record<string, number> = {};

    if (agencyIds.length > 0) {
      const agentCountResults = await db
        .select({
          agencyId: agencyAgent.agencyId,
          count: count(agencyAgent.id),
        })
        .from(agencyAgent)
        .where(and(inArray(agencyAgent.agencyId, agencyIds), eq(agencyAgent.isActive, true)))
        .groupBy(agencyAgent.agencyId);

      // Convert to lookup map
      agentCountResults.forEach(({ agencyId, count: agentCount }) => {
        agentCounts[agencyId] = agentCount;
      });
    }

    // Add stats to agencies
    const agenciesWithStats = agenciesWithAgents.map((agencyItem) => ({
      ...agencyItem,
      agentCount: agentCounts[agencyItem.id] || 0,
    }));

    sendSuccessResponse(response, 200, 'Admin agency search completed', {
      agencies: agenciesWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      searchTerm: search,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADMIN_SEARCH_AGENCY');
    sendErrorResponse(response, 500, `Failed to search agencies: ${(error as Error).message}`);
  }
};

export default adminSearchAgency;
