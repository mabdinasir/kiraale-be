import db, { property, propertyView } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { getPropertyAnalyticsParamsSchema, getPropertyAnalyticsQuerySchema } from '@schemas';
import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getPropertyAnalytics: RequestHandler = async (request, response) => {
  try {
    const { id: propertyId } = getPropertyAnalyticsParamsSchema.parse(request.params);
    const { period, startDate, endDate } = getPropertyAnalyticsQuerySchema.parse(request.query);

    // Verify property exists and user has permission to view analytics
    const userId = request.user?.id;
    const userRole = request.user?.role;

    const [existingProperty] = await db
      .select({
        id: property.id,
        userId: property.userId,
        title: property.title,
      })
      .from(property)
      .where(eq(property.id, propertyId));

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Check permissions - owner or admin can view analytics
    if (userRole !== 'ADMIN' && existingProperty.userId !== userId) {
      sendErrorResponse(response, 403, 'Not authorized to view analytics for this property');
      return;
    }

    // Calculate date range based on period
    let analyticsStartDate = new Date();
    let analyticsEndDate = new Date();

    if (startDate && endDate) {
      analyticsStartDate = new Date(startDate);
      analyticsEndDate = new Date(endDate);
    } else {
      switch (period) {
        case 'day':
          analyticsStartDate.setDate(analyticsStartDate.getDate() - 1);
          break;
        case 'week':
          analyticsStartDate.setDate(analyticsStartDate.getDate() - 7);
          break;
        case 'month':
          analyticsStartDate.setMonth(analyticsStartDate.getMonth() - 1);
          break;
        case 'year':
          analyticsStartDate.setFullYear(analyticsStartDate.getFullYear() - 1);
          break;
        default:
          analyticsStartDate.setDate(analyticsStartDate.getDate() - 7);
      }
    }

    // Base conditions for analytics queries
    const baseConditions = [
      eq(propertyView.propertyId, propertyId),
      gte(propertyView.viewedAt, analyticsStartDate),
      lte(propertyView.viewedAt, analyticsEndDate),
    ];

    // Get total views
    const [{ totalViews }] = await db
      .select({ totalViews: count() })
      .from(propertyView)
      .where(and(...baseConditions));

    // Get unique users (registered users)
    const [{ uniqueUsers }] = await db
      .select({ uniqueUsers: sql<number>`count(distinct ${propertyView.userId})` })
      .from(propertyView)
      .where(and(...baseConditions, sql`${propertyView.userId} IS NOT NULL`));

    // Get unique sessions (anonymous + registered)
    const [{ uniqueSessions }] = await db
      .select({
        uniqueSessions: sql<number>`count(distinct coalesce(${propertyView.userId}::text, ${propertyView.sessionId}))`,
      })
      .from(propertyView)
      .where(and(...baseConditions));

    // Get daily views for the period
    const dailyViews = await db
      .select({
        date: sql<string>`date(${propertyView.viewedAt})`,
        views: count(),
        uniqueViews: sql<number>`count(distinct coalesce(${propertyView.userId}::text, ${propertyView.sessionId}))`,
      })
      .from(propertyView)
      .where(and(...baseConditions))
      .groupBy(sql`date(${propertyView.viewedAt})`)
      .orderBy(sql`date(${propertyView.viewedAt})`);

    // Get top referrers
    const topReferrers = await db
      .select({
        referrer: propertyView.referrer,
        views: count(),
      })
      .from(propertyView)
      .where(and(...baseConditions, sql`${propertyView.referrer} IS NOT NULL`))
      .groupBy(propertyView.referrer)
      .orderBy(sql`count(*) desc`)
      .limit(50);

    // Get hourly distribution for day/week periods
    let hourlyDistribution: { hour: number; views: number }[] = [];
    if (period === 'day' || period === 'week') {
      hourlyDistribution = await db
        .select({
          hour: sql<number>`extract(hour from ${propertyView.viewedAt})`,
          views: count(),
        })
        .from(propertyView)
        .where(and(...baseConditions))
        .groupBy(sql`extract(hour from ${propertyView.viewedAt})`)
        .orderBy(sql`extract(hour from ${propertyView.viewedAt})`);
    }

    // Calculate growth metrics (comparison with previous period)
    const previousPeriodStart = new Date(analyticsStartDate);
    const previousPeriodEnd = new Date(analyticsStartDate);
    const periodDuration = analyticsEndDate.getTime() - analyticsStartDate.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);

    const [{ previousViews }] = await db
      .select({ previousViews: count() })
      .from(propertyView)
      .where(
        and(
          eq(propertyView.propertyId, propertyId),
          gte(propertyView.viewedAt, previousPeriodStart),
          lte(propertyView.viewedAt, previousPeriodEnd),
        ),
      );

    let viewsGrowth = 0;
    if (previousViews > 0) {
      viewsGrowth = ((totalViews - previousViews) / previousViews) * 100;
    } else if (totalViews > 0) {
      viewsGrowth = 100;
    }

    response.status(200).json({
      success: true,
      data: {
        property: {
          id: existingProperty.id,
          title: existingProperty.title,
        },
        period: {
          type: period,
          startDate: analyticsStartDate.toISOString(),
          endDate: analyticsEndDate.toISOString(),
        },
        overview: {
          totalViews,
          uniqueUsers,
          uniqueSessions,
          viewsGrowth: Math.round(viewsGrowth * 100) / 100,
        },
        dailyViews,
        topReferrers,
        ...(hourlyDistribution.length > 0 && { hourlyDistribution }),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'ADMIN_GET_PROPERTY_ANALYTICS');
    sendErrorResponse(response, 500, 'Failed to retrieve property analytics.');
  }
};

export default getPropertyAnalytics;
