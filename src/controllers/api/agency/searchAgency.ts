import db, { agency, agencyAgent, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchAgencySchema } from '@schemas';
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const searchAgency: RequestHandler = async (request, response) => {
  try {
    const searchParams = searchAgencySchema.parse(request.query);

    const {
      page,
      limit,
      search,
      country,
      email,
      phone,
      website,
      licenseNumber,
      address,
      createdAfter,
      createdBefore,
      includeAgents,
      sortBy,
      sortOrder,
    } = searchParams;

    // Build filters array
    const filters = [];

    // Always filter out suspended agencies and only show active agencies in public API
    filters.push(eq(agency.isSuspended, false));
    filters.push(eq(agency.isActive, true));

    // Text search - search in name, description, and address
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      filters.push(
        or(
          ilike(agency.name, searchTerm),
          ilike(agency.description, searchTerm),
          ilike(agency.address, searchTerm),
        ),
      );
    }

    // Core filters
    if (country) {
      filters.push(eq(agency.country, country));
    }

    // isActive filter removed for public API - always show only active agencies

    // Contact and verification filters
    if (email) {
      filters.push(ilike(agency.email, `%${email}%`));
    }

    if (phone) {
      filters.push(ilike(agency.phone, `%${phone}%`));
    }

    if (website) {
      filters.push(ilike(agency.website, `%${website}%`));
    }

    if (licenseNumber) {
      filters.push(ilike(agency.licenseNumber, `%${licenseNumber}%`));
    }

    // Location filter
    if (address) {
      filters.push(ilike(agency.address, `%${address}%`));
    }

    // Date filters
    if (createdAfter) {
      filters.push(gte(agency.createdAt, createdAfter));
    }

    if (createdBefore) {
      filters.push(lte(agency.createdAt, createdBefore));
    }

    // Remove null/undefined filters
    const validFilters = filters.filter(Boolean);

    // Build sorting
    const getSortColumn = () => {
      switch (sortBy) {
        case 'name':
          return agency.name;
        case 'createdAt':
          return agency.createdAt;
        case 'updatedAt':
          return agency.updatedAt;
        case 'country':
          return agency.country;
        default:
          return agency.createdAt;
      }
    };

    const sortColumn = getSortColumn();
    const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Execute search query with admin fields
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
      .where(validFilters.length > 0 ? and(...validFilters) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ totalCount }] = await db
      .select({ totalCount: sql<number>`count(*)::int` })
      .from(agency)
      .where(validFilters.length > 0 ? and(...validFilters) : undefined);

    const totalPages = Math.ceil(totalCount / limit);

    // Get agents for agencies if requested (with admin details including roles)
    let agenciesWithAgents = agencies;
    if (includeAgents && agencies.length > 0) {
      // Group agents by agency ID
      interface PublicAgentWithUser {
        agencyId: string;
        id: string;
        isActive: boolean;
        joinedAt: Date;
        leftAt: Date | null;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          mobile: string | null;
        } | null;
      }
      const agentsByAgency: Record<string, PublicAgentWithUser[]> = {};

      // Get all agents for all agencies in a single query
      const agencyIds = agencies.map((agencyItem) => agencyItem.id);
      const allAgents = await db
        .select({
          agencyId: agencyAgent.agencyId,
          id: agencyAgent.id,
          // role excluded for public API
          isActive: agencyAgent.isActive,
          joinedAt: agencyAgent.joinedAt,
          leftAt: agencyAgent.leftAt,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobile: user.mobile,
            // role and agentNumber excluded for public API
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

      // Add agents to agencies
      agenciesWithAgents = agencies.map((agencyItem) => ({
        ...agencyItem,
        agents: agentsByAgency[agencyItem.id] || [],
      }));
    }

    // Get agent counts for analytics
    const agencyIds = agencies.map((agencyItem) => agencyItem.id);
    const agentCounts: Record<string, number> = {};

    if (agencyIds.length > 0) {
      const agentCountResults = await db
        .select({
          agencyId: agencyAgent.agencyId,
          count: sql<number>`count(*)::int`,
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
      agentCount: agentCounts[agencyItem.id] ?? 0,
    }));

    sendSuccessResponse(response, 200, 'Agencies retrieved successfully', {
      agencies: agenciesWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        applied: Object.entries(searchParams).reduce<Record<string, unknown>>(
          (acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '' && key !== 'includeAgents') {
              acc[key] = value;
            }
            return acc;
          },
          {},
        ),
        total: validFilters.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'SEARCH_AGENCY');
    sendErrorResponse(response, 500, `Failed to search agencies: ${(error as Error).message}`);
  }
};

export default searchAgency;
