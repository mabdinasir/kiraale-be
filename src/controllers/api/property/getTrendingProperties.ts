import db from '@db/index';
import { media, property, propertyView, user } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { trendingPropertiesSchema } from '@schemas/property.schema';
import { count, desc, eq, inArray, ne, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getTrendingProperties: RequestHandler = async (request, response) => {
  try {
    const { page, limit, period, country, propertyType, listingType } =
      trendingPropertiesSchema.parse(request.query);

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Build property filters - show all properties except PENDING ones
    const propertyFilters = [ne(property.status, 'PENDING')];

    if (country) {
      propertyFilters.push(sql`${property.country} = ${country}`);
    }
    if (propertyType) {
      propertyFilters.push(eq(property.propertyType, propertyType));
    }
    if (listingType) {
      propertyFilters.push(eq(property.listingType, listingType));
    }

    // Get trending properties based on views
    const trendingProperties = await db
      .select({
        id: property.id,
        userId: property.userId,
        agencyId: property.agencyId,
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
        reviewedAt: property.reviewedAt,
        reviewedBy: property.reviewedBy,
        rejectionReason: property.rejectionReason,
        adminNotes: property.adminNotes,
        searchVector: property.searchVector,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        deletedAt: property.deletedAt,
        viewCount: sql<number>`coalesce(${count(propertyView.id)}, 0)`,
        uniqueViewCount: sql<number>`coalesce(count(distinct coalesce(${propertyView.userId}::text, ${propertyView.sessionId})), 0)`,
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
      .leftJoin(
        propertyView,
        sql`${property.id} = ${propertyView.propertyId} AND ${propertyView.viewedAt} >= ${startDate} AND ${propertyView.viewedAt} <= ${endDate}`,
      )
      .where(sql`${sql.join(propertyFilters, sql.raw(' AND '))}`)
      .groupBy(
        property.id,
        property.userId,
        property.agencyId,
        property.title,
        property.description,
        property.propertyType,
        property.listingType,
        property.bedrooms,
        property.bathrooms,
        property.parkingSpaces,
        property.landSize,
        property.floorArea,
        property.hasAirConditioning,
        property.address,
        property.country,
        property.price,
        property.priceType,
        property.rentFrequency,
        property.status,
        property.availableFrom,
        property.reviewedAt,
        property.reviewedBy,
        property.rejectionReason,
        property.adminNotes,
        property.searchVector,
        property.createdAt,
        property.updatedAt,
        property.deletedAt,
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        user.mobile,
        user.profilePicture,
        user.agentNumber,
      )
      .orderBy(
        desc(
          sql`coalesce(count(distinct coalesce(${propertyView.userId}::text, ${propertyView.sessionId})), 0)`,
        ),
      )
      .limit(limit)
      .offset((page - 1) * limit);

    // Get total properties count for pagination
    const [{ totalProperties }] = await db
      .select({ totalProperties: count() })
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(sql`${sql.join(propertyFilters, sql.raw(' AND '))}`);

    const totalPages = Math.ceil(totalProperties / limit);

    // Get media for all properties
    const propertyIds = trendingProperties.map((propertyItem) => propertyItem.id);
    const allMedia =
      propertyIds.length > 0
        ? await db
            .select()
            .from(media)
            .where(inArray(media.propertyId, propertyIds))
            .orderBy(media.displayOrder, media.uploadedAt)
        : [];

    // Group media by property ID
    const mediaByPropertyId = allMedia.reduce<Record<string, typeof allMedia>>((acc, mediaItem) => {
      if (!acc[mediaItem.propertyId]) {
        acc[mediaItem.propertyId] = [];
      }
      acc[mediaItem.propertyId].push(mediaItem);
      return acc;
    }, {});

    // Add media to each property
    const propertiesWithMedia = trendingProperties.map((propertyItem) => ({
      ...propertyItem,
      media: mediaByPropertyId[propertyItem.id] || [],
    }));

    sendSuccessResponse(response, 200, 'Trending properties retrieved successfully', {
      properties: propertiesWithMedia,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProperties,
        itemsPerPage: limit,
      },
      period: {
        type: period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      filters: {
        ...(country && { country }),
        ...(propertyType && { propertyType }),
        ...(listingType && { listingType }),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_TRENDING_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to retrieve trending properties.');
  }
};

export default getTrendingProperties;
