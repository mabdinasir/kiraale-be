import db, { agency } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getAgenciesSchema } from '@schemas';
import { and, count, eq, ilike, or } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getAgencies: RequestHandler = async (request, response) => {
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

    // Get agencies with pagination
    const agencies = await db
      .select()
      .from(agency)
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

    sendSuccessResponse(response, 200, 'Agencies retrieved successfully', {
      agencies,
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

    logError(error, 'GET_AGENCIES');
    sendErrorResponse(response, 500, `Failed to retrieve agencies: ${(error as Error).message}`);
  }
};

export default getAgencies;
