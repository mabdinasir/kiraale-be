import db, { property, user } from '@db';
import {
  addMediaToProperties,
  getMediaForProperties,
  getPublicPropertySelection,
  getPublicPropertyWithActiveUserFilters,
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib';
import { queryPropertiesSchema } from '@schemas';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getProperties: RequestHandler = async (request, response) => {
  try {
    const {
      page = 1,
      limit = 50,
      propertyType,
      listingType,
      country,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      hasAirConditioning,
    } = queryPropertiesSchema.parse(request.query);

    // Build filters
    const filters = getPublicPropertyWithActiveUserFilters();

    if (propertyType) {
      filters.push(eq(property.propertyType, propertyType));
    }
    if (listingType) {
      filters.push(eq(property.listingType, listingType));
    }
    if (country) {
      filters.push(eq(property.country, country));
    }
    if (minPrice) {
      filters.push(gte(property.price, minPrice.toString()));
    }
    if (maxPrice) {
      filters.push(lte(property.price, maxPrice.toString()));
    }
    if (bedrooms !== undefined) {
      filters.push(eq(property.bedrooms, bedrooms));
    }
    if (bathrooms !== undefined) {
      filters.push(eq(property.bathrooms, bathrooms));
    }
    if (hasAirConditioning !== undefined) {
      filters.push(eq(property.hasAirConditioning, hasAirConditioning));
    }

    const offset = (page - 1) * limit; // offset is the number of records to skip

    const properties = await db
      .select(getPublicPropertySelection())
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(and(...filters))
      .limit(limit)
      .offset(offset)
      .orderBy(property.createdAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(and(...filters));

    const totalProperties = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalProperties / limit);

    // Get media for all properties
    const propertyIds = properties.map((propertyItem) => propertyItem.id);
    const mediaByPropertyId = await getMediaForProperties(propertyIds);

    // Add media to each property
    const propertiesWithMedia = addMediaToProperties(properties, mediaByPropertyId);

    sendSuccessResponse(response, 200, 'Properties retrieved successfully', {
      properties: propertiesWithMedia,
      pagination: {
        page,
        limit,
        total: totalProperties,
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

    logError(error, 'GET_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to retrieve properties.');
  }
};

export default getProperties;
