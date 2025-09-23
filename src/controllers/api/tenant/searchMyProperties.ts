import db, { property } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchMyPropertiesSchema } from '@schemas';
import { and, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const searchMyProperties: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const queryValidation = searchMyPropertiesSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 20, search } = queryValidation.data;

    // Build query conditions - only show user's properties
    const conditions = [
      eq(property.userId, requestingUserId),
      isNull(property.deletedAt), // Only active properties
    ];

    if (search) {
      const searchCondition = or(
        ilike(property.title, `%${search}%`),
        ilike(property.address, `%${search}%`),
        ilike(property.propertyType, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Get properties with pagination - only select essential fields for UI
    const properties = await db
      .select({
        id: property.id,
        title: property.title,
        address: property.address,
        propertyType: property.propertyType,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        status: property.status,
      })
      .from(property)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(property.createdAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(property)
      .where(and(...conditions));

    const totalProperties = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalProperties / limit);

    sendSuccessResponse(response, 200, 'Properties retrieved successfully', {
      properties,
      pagination: {
        page,
        limit,
        total: totalProperties,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
      },
    });
  } catch (error) {
    logError(error, 'SEARCH_MY_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to search properties.');
  }
};

export default searchMyProperties;
