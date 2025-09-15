import db, { property, propertyView } from '@db';
import { handleValidationError, logError, sendErrorResponse } from '@lib';
import { recordPropertyViewSchema } from '@schemas';
import { and, eq, gte } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const recordPropertyView: RequestHandler = async (request, response) => {
  try {
    const viewData = recordPropertyViewSchema.parse(request.body);
    const { propertyId, userId, sessionId, userAgent, referrer } = viewData;

    // Get authenticated user if available
    const authenticatedUserId = request.user?.id;

    // Verify property exists and check access permissions
    const [existingProperty] = await db
      .select({ id: property.id, userId: property.userId, status: property.status })
      .from(property)
      .where(eq(property.id, propertyId));

    if (!existingProperty) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Check if user can record views for this property
    // Rule: Users can record views for non-pending properties OR their own properties (including pending)
    const canRecordView = authenticatedUserId
      ? existingProperty.status !== 'PENDING' || existingProperty.userId === authenticatedUserId
      : existingProperty.status !== 'PENDING';

    if (!canRecordView) {
      sendErrorResponse(response, 404, 'Property not found');
      return;
    }

    // Check for duplicate views in the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const duplicateCheckConditions = [
      eq(propertyView.propertyId, propertyId),
      gte(propertyView.viewedAt, twentyFourHoursAgo),
    ];

    if (userId) {
      duplicateCheckConditions.push(eq(propertyView.userId, userId));
    } else if (sessionId) {
      duplicateCheckConditions.push(eq(propertyView.sessionId, sessionId));
    }

    const [existingView] = await db
      .select({ id: propertyView.id })
      .from(propertyView)
      .where(and(...duplicateCheckConditions))
      .limit(1);

    if (existingView) {
      response.status(200).json({
        success: true,
        message: 'View already recorded within 24 hours',
        data: { recorded: false },
      });
      return;
    }

    // Get client IP and user agent from request
    const clientIp =
      request.headers['x-forwarded-for']?.toString()?.split(',')[0]?.trim() ??
      request.headers['x-real-ip']?.toString() ??
      request.socket.remoteAddress ??
      request.ip;

    const clientUserAgent =
      userAgent ?? request.headers['user-agent']?.toString().slice(0, 500) ?? null;
    const clientReferrer = referrer ?? request.headers.referer?.toString().slice(0, 500) ?? null;

    // Record the view
    const [newView] = await db
      .insert(propertyView)
      .values({
        propertyId,
        userId: userId ?? null,
        sessionId: sessionId ?? null,
        ipAddress: clientIp,
        userAgent: clientUserAgent,
        referrer: clientReferrer,
      })
      .returning();

    response.status(201).json({
      success: true,
      message: 'Property view recorded successfully',
      data: {
        recorded: true,
        viewId: newView.id,
        viewedAt: newView.viewedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'RECORD_PROPERTY_VIEW');
    sendErrorResponse(response, 500, 'Failed to record property view.');
  }
};

export default recordPropertyView;
