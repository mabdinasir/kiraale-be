import db, { property, propertyView } from '@db';
import { logError } from '@lib';
import type { ViewTrackingRequest } from '@models';
import { and, eq, gte } from 'drizzle-orm';
import type { NextFunction, Response } from 'express';

const viewTrackingMiddleware =
  () => async (req: ViewTrackingRequest, res: Response, next: NextFunction) => {
    try {
      // Only track views for GET requests to single property endpoints
      if (req.method !== 'GET') {
        next();
        return;
      }

      // Extract property ID from request params
      const propertyId = req.params.id || req.params.propertyId;
      if (!propertyId) {
        next();
        return;
      }

      // Verify it's a valid UUID format
      const uuidRegex = /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu;
      if (!uuidRegex.test(propertyId)) {
        next();
        return;
      }

      // Check if property exists and is approved
      const [existingProperty] = await db
        .select({ id: property.id, status: property.status })
        .from(property)
        .where(eq(property.id, propertyId))
        .limit(1);

      if (!existingProperty || existingProperty.status !== 'AVAILABLE') {
        next();
        return;
      }

      // Get user information
      const userId = req.user?.id;
      const sessionId = req.sessionID ?? (req.headers['x-session-id'] as string);

      // Skip tracking if no user ID or session ID
      if (!userId && !sessionId) {
        next();
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

      // If view already exists, skip tracking
      if (existingView) {
        next();
        return;
      }

      // Get client information
      const clientIp =
        req.headers['x-forwarded-for']?.toString()?.split(',')[0]?.trim() ??
        req.headers['x-real-ip']?.toString() ??
        req.socket.remoteAddress ??
        req.ip;

      const clientUserAgent = req.headers['user-agent']?.toString().slice(0, 500) ?? null;
      const clientReferrer = req.headers.referer?.toString().slice(0, 500) ?? null;

      // Record the view asynchronously (don't block the request)
      setImmediate(() => {
        (async (): Promise<void> => {
          try {
            await db.insert(propertyView).values({
              propertyId,
              userId: userId ?? null,
              sessionId: sessionId ?? null,
              ipAddress: clientIp,
              userAgent: clientUserAgent,
              referrer: clientReferrer,
            });

            logError(
              `Property view recorded: ${propertyId} by ${userId ? `user:${userId}` : `session:${sessionId}`}`,
              'VIEW_TRACKING_SUCCESS',
            );
          } catch (error) {
            logError(error, 'VIEW_TRACKING_MIDDLEWARE');
          }
        })().catch((error: unknown) => {
          logError(error, 'VIEW_TRACKING_MIDDLEWARE_ASYNC');
        });
      });

      // Add tracking info to request for potential use by controllers
      req.viewTracking = {
        propertyId,
        shouldTrack: true,
      };

      next();
    } catch (error) {
      // Don't fail the request if view tracking fails
      logError(error, 'VIEW_TRACKING_MIDDLEWARE');
      next();
    }
  };

export default viewTrackingMiddleware;
