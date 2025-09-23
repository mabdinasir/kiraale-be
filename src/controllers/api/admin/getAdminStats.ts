import db, { property, user } from '@db';
import { logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { and, gte, isNull, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const getAdminStats: RequestHandler = async (request, response) => {
  try {
    // Get user counts (active users only)
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(isNull(user.deletedAt));
    const totalUsers = totalUsersResult?.count ?? 0;

    // Get property counts by status using aggregation (non-deleted properties only)
    const propertyStatusCounts = await db
      .select({
        status: property.status,
        count: sql<number>`count(*)::int`,
      })
      .from(property)
      .where(isNull(property.deletedAt))
      .groupBy(property.status);

    // Get properties by listing type (non-deleted properties only)
    const listingTypeCounts = await db
      .select({
        listingType: property.listingType,
        count: sql<number>`count(*)::int`,
      })
      .from(property)
      .where(isNull(property.deletedAt))
      .groupBy(property.listingType);

    // Get recent activity (properties created in last 30 days, non-deleted)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentPropertiesResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(property)
      .where(and(isNull(property.deletedAt), gte(property.createdAt, thirtyDaysAgo)));

    // Convert results to maps for easy lookup
    const statusCountMap = propertyStatusCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item.count ?? 0;
      return acc;
    }, {});

    const listingTypeCountMap = listingTypeCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.listingType] = item.count ?? 0;
      return acc;
    }, {});

    // Calculate totals and ensure all status counts exist
    const pending = statusCountMap.PENDING ?? 0;
    const available = statusCountMap.AVAILABLE ?? 0;
    const rejected = statusCountMap.REJECTED ?? 0;
    const leased = statusCountMap.LEASED ?? 0;
    const sold = statusCountMap.SOLD ?? 0;
    const expired = statusCountMap.EXPIRED ?? 0;

    const totalProperties = pending + available + rejected + leased + sold + expired;
    const recentProperties = recentPropertiesResult?.count ?? 0;

    const stats = {
      users: {
        total: totalUsers,
      },
      properties: {
        total: totalProperties,
        pending,
        available,
        rejected,
        leased,
        sold,
        expired,
        recentlyAdded: recentProperties, // Last 30 days
      },
      listingTypes: {
        sale: listingTypeCountMap.SALE ?? 0,
        rent: listingTypeCountMap.RENT ?? 0,
      },
      summary: {
        awaitingReview: pending,
        liveProperties: available,
        completedTransactions: leased + sold,
      },
    };

    sendSuccessResponse(response, 200, 'Admin statistics retrieved successfully', stats);
  } catch (error) {
    logError(error, 'GET_ADMIN_STATS');
    sendErrorResponse(response, 500, 'Failed to retrieve admin statistics.');
  }
};

export default getAdminStats;
