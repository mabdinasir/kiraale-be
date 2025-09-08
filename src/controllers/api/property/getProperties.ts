import db from '@db/index';
import { property, user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { queryPropertiesSchema } from '@schemas/property.schema';
import { and, eq, gte, lte, ne } from 'drizzle-orm';
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
    const filters = [];

    // For public listings, show all properties except PENDING ones
    // Only hide PENDING properties from regular users
    filters.push(ne(property.status, 'PENDING'));

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
      .select({
        // Property fields
        id: property.id,
        userId: property.userId,
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parkingSpaces: property.parkingSpaces,
        landSize: property.landSize,
        floorArea: property.floorArea,
        hasAirConditioning: property.hasAirConditioning,
        address: property.address,
        country: property.country,
        price: property.price,
        priceType: property.priceType,
        rentFrequency: property.rentFrequency,
        status: property.status,
        availableFrom: property.availableFrom,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        // User fields (summary for public display)
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          profilePicture: user.profilePicture,
          agentNumber: user.agentNumber,
        },
      })
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(and(...filters))
      .limit(limit)
      .offset(offset)
      .orderBy(property.createdAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: property.id })
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(and(...filters));

    const totalProperties = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalProperties / limit);

    sendSuccessResponse(response, 200, 'Properties retrieved successfully', {
      properties,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProperties,
        itemsPerPage: limit,
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
