import db from '@db/index';
import { property } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { queryPropertiesSchema } from '@schemas/property.schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getProperties: RequestHandler = async (request, response) => {
  try {
    const {
      page = 1,
      limit = 10,
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
    const filters = [];

    // For public listings, only show APPROVED properties
    // Status parameter is ignored for security - public can't see pending/rejected
    filters.push(eq(property.status, 'APPROVED'));

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
      .select()
      .from(property)
      .where(and(...filters))
      .limit(limit)
      .offset(offset)
      .orderBy(property.createdAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: property.id })
      .from(property)
      .where(and(...filters));

    const totalProperties = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalProperties / limit);

    response.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalProperties,
          itemsPerPage: limit,
        },
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
