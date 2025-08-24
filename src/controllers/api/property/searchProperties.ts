import db from '@db/index';
import { property } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { propertySearchSchema } from '@schemas';
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const searchProperties: RequestHandler = async (request, response) => {
  try {
    const searchParams = propertySearchSchema.parse(request.query);

    const {
      page,
      limit,
      search,
      propertyType,
      listingType,
      status,
      country,
      minPrice,
      maxPrice,
      priceType,
      rentFrequency,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minParkingSpaces,
      maxParkingSpaces,
      minLandSize,
      maxLandSize,
      minFloorArea,
      maxFloorArea,
      hasAirConditioning,
      address,
      availableFrom,
      createdAfter,
      createdBefore,
      userId,
      agencyId,
      sortBy,
      sortOrder,
    } = searchParams;

    // Build filters array
    const filters = [];

    // Status filter - default to APPROVED for public access
    // Admin endpoints can override this by passing status parameter
    if (status) {
      filters.push(eq(property.status, status));
    } else {
      filters.push(eq(property.status, 'APPROVED'));
    }

    // Text search - search in title, description, and address
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      filters.push(
        or(
          ilike(property.title, searchTerm),
          ilike(property.description, searchTerm),
          ilike(property.address, searchTerm),
          // Full-text search using tsvector (when implemented)
          search.length > 3
            ? sql`to_tsvector('english', ${property.title} || ' ' || coalesce(${property.description}, '') || ' ' || ${property.address}) @@ plainto_tsquery('english', ${search})`
            : undefined,
        ),
      );
    }

    // Core property filters
    if (propertyType) {
      filters.push(eq(property.propertyType, propertyType));
    }
    if (listingType) {
      filters.push(eq(property.listingType, listingType));
    }
    if (country) {
      filters.push(sql`${property.country} = ${country}`);
    }

    // Price filters
    if (minPrice) {
      filters.push(gte(property.price, minPrice.toString()));
    }
    if (maxPrice) {
      filters.push(lte(property.price, maxPrice.toString()));
    }
    if (priceType) {
      filters.push(eq(property.priceType, priceType));
    }
    if (rentFrequency) {
      filters.push(eq(property.rentFrequency, rentFrequency));
    }

    // Room and space filters
    if (minBedrooms) {
      filters.push(gte(property.bedrooms, minBedrooms));
    }
    if (maxBedrooms) {
      filters.push(lte(property.bedrooms, maxBedrooms));
    }
    if (minBathrooms) {
      filters.push(gte(property.bathrooms, minBathrooms));
    }
    if (maxBathrooms) {
      filters.push(lte(property.bathrooms, maxBathrooms));
    }
    if (minParkingSpaces) {
      filters.push(gte(property.parkingSpaces, minParkingSpaces));
    }
    if (maxParkingSpaces) {
      filters.push(lte(property.parkingSpaces, maxParkingSpaces));
    }

    // Size filters
    if (minLandSize) {
      filters.push(gte(property.landSize, minLandSize.toString()));
    }
    if (maxLandSize) {
      filters.push(lte(property.landSize, maxLandSize.toString()));
    }
    if (minFloorArea) {
      filters.push(gte(property.floorArea, minFloorArea.toString()));
    }
    if (maxFloorArea) {
      filters.push(lte(property.floorArea, maxFloorArea.toString()));
    }

    // Feature filters
    if (hasAirConditioning !== undefined) {
      filters.push(eq(property.hasAirConditioning, hasAirConditioning));
    }

    // Location filter
    if (address) {
      filters.push(ilike(property.address, `%${address}%`));
    }

    // Date filters
    if (availableFrom) {
      filters.push(gte(property.availableFrom, new Date(availableFrom)));
    }
    if (createdAfter) {
      filters.push(gte(property.createdAt, new Date(createdAfter)));
    }
    if (createdBefore) {
      filters.push(lte(property.createdAt, new Date(createdBefore)));
    }

    // User/Agency filters
    if (userId) {
      filters.push(eq(property.userId, userId));
    }
    if (agencyId) {
      filters.push(eq(property.agencyId, agencyId));
    }

    // Remove null/undefined filters
    const validFilters = filters.filter(Boolean);

    // Build sorting
    const getSortColumn = () => {
      switch (sortBy) {
        case 'createdAt':
          return property.createdAt;
        case 'updatedAt':
          return property.updatedAt;
        case 'price':
          return property.price;
        case 'bedrooms':
          return property.bedrooms;
        case 'bathrooms':
          return property.bathrooms;
        case 'landSize':
          return property.landSize;
        case 'floorArea':
          return property.floorArea;
        case 'views':
          return property.createdAt; // Views sorting not implemented yet, default to createdAt
        default:
          return property.createdAt;
      }
    };
    const sortColumn = getSortColumn();
    const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Execute search query
    const properties = await db
      .select()
      .from(property)
      .where(validFilters.length > 0 ? and(...validFilters) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(property)
      .where(validFilters.length > 0 ? and(...validFilters) : undefined);

    const totalPages = Math.ceil(totalCount / limit);

    response.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        filters: {
          applied: Object.entries(searchParams).reduce<Record<string, unknown>>(
            (acc, [key, value]) => {
              if (value !== undefined && value !== null && value !== '') {
                acc[key] = value;
              }
              return acc;
            },
            {},
          ),
          total: validFilters.length,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'SEARCH_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to search properties.');
  }
};

export default searchProperties;
