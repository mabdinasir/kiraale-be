import db, { agency, agencyAgent, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getAgenciesSchema } from '@schemas';
import { and, count, eq, ilike, inArray, or } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const adminGetAgencies: RequestHandler = async (request, response) => {
  try {
    const validatedQuery = getAgenciesSchema.parse(request.query);
    const { page, limit, country, isActive, search } = validatedQuery;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (country) {
      whereConditions.push(eq(agency.country, country));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(agency.isActive, isActive));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(agency.name, `%${search}%`),
          ilike(agency.description, `%${search}%`),
          ilike(agency.address, `%${search}%`),
        ),
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get agencies with full admin details including creator info
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
          role: user.role,
        },
      })
      .from(agency)
      .leftJoin(user, eq(agency.createdById, user.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(agency.createdAt);

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count(agency.id) })
      .from(agency)
      .where(whereClause);

    const totalPages = Math.ceil(totalCount / limit);

    // Get agent counts for each agency in a single query
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

    // Add agent count to each agency
    const agenciesWithStats = agencies.map((agencyItem) => ({
      ...agencyItem,
      agentCount: agentCounts[agencyItem.id] || 0,
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
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADMIN_GET_AGENCIES');
    sendErrorResponse(response, 500, `Failed to retrieve agencies: ${(error as Error).message}`);
  }
};

export default adminGetAgencies;
