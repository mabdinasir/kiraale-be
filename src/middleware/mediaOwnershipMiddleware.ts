import db from '@db/index';
import { media, property } from '@db/schemas';
import { hasPermission } from '@lib/permissions/checker';
import { sendErrorResponse } from '@lib/utils';
import type { Permission } from '@models/permisions';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

/**
 * Middleware to check if user owns the media (via property ownership) or has the required permission
 */
export function requireMediaOwnership(fallbackPermission: Permission): RequestHandler {
  return async (req, res, next) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const mediaId = req.params.id;

    if (!userRole || !userId) {
      sendErrorResponse(res, 401, 'Authentication required');
      return;
    }

    if (!mediaId) {
      sendErrorResponse(res, 400, 'Media ID is required');
      return;
    }

    try {
      // Get media and associated property owner
      const [mediaWithProperty] = await db
        .select({
          mediaId: media.id,
          propertyId: media.propertyId,
          propertyOwnerId: property.userId,
        })
        .from(media)
        .innerJoin(property, eq(media.propertyId, property.id))
        .where(eq(media.id, mediaId))
        .limit(1);

      if (!mediaWithProperty) {
        sendErrorResponse(res, 404, 'Media not found');
        return;
      }

      // If user owns the property (and thus the media), allow access
      if (userId === mediaWithProperty.propertyOwnerId) {
        next();
        return;
      }

      // Otherwise check if they have the fallback permission
      if (!hasPermission(userRole, fallbackPermission)) {
        sendErrorResponse(
          res,
          403,
          `Access denied. Required permission: ${fallbackPermission} or resource ownership`,
        );
        return;
      }

      next();
    } catch (error) {
      sendErrorResponse(res, 500, `Failed to verify media ownership: ${(error as Error).message}`);
    }
  };
}
