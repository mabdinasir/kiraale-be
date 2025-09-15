import db, { agencyAgent } from '@db';
import { sendErrorResponse } from '@lib';
import type { Permission } from '@models';
import { and, eq } from 'drizzle-orm';
import type { Request, RequestHandler } from 'express';
import { hasAllPermissions, hasAnyPermission, hasPermission } from './checker';

// Generic permission middleware
export function requirePermission(requiredPermission: Permission): RequestHandler {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      sendErrorResponse(res, 401, 'Authentication required');
      return;
    }

    if (!hasPermission(userRole, requiredPermission)) {
      sendErrorResponse(res, 403, `Access denied. Required permission: ${requiredPermission}`);
      return;
    }

    next();
  };
}

// Require any of the specified permissions
export function requireAnyPermission(requiredPermissions: Permission[]): RequestHandler {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      sendErrorResponse(res, 401, 'Authentication required');
      return;
    }

    if (!hasAnyPermission(userRole, requiredPermissions)) {
      sendErrorResponse(
        res,
        403,
        `Access denied. Required one of: ${requiredPermissions.join(', ')}`,
      );
      return;
    }

    next();
  };
}

// Require all of the specified permissions
export function requireAllPermissions(requiredPermissions: Permission[]): RequestHandler {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      sendErrorResponse(res, 401, 'Authentication required');
      return;
    }

    if (!hasAllPermissions(userRole, requiredPermissions)) {
      sendErrorResponse(
        res,
        403,
        `Access denied. Required all of: ${requiredPermissions.join(', ')}`,
      );
      return;
    }

    next();
  };
}

// Resource ownership middleware - checks if user owns resource or has permission
export function requireResourceAccess(
  getResourceOwnerId: (req: Request) => string | null,
  fallbackPermission: Permission,
): RequestHandler {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userRole || !userId) {
      sendErrorResponse(res, 401, 'Authentication required');
      return;
    }

    const resourceOwnerId = getResourceOwnerId(req);

    // If user owns the resource, allow access
    if (userId === resourceOwnerId) {
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
  };
}

// Agency-specific permission checker
export function requireAgencyAccess(permission: Permission): RequestHandler {
  return async (req, res, next) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const agencyId = req.params.id || req.params.agencyId;

    if (!userRole || !userId) {
      sendErrorResponse(res, 401, 'Authentication required');
      return;
    }

    // Platform admins can access everything
    if (hasPermission(userRole, 'ADMIN_ACCESS')) {
      next();
      return;
    }

    // Check if user has the general permission (like AGENCY_WRITE)
    if (hasPermission(userRole, permission)) {
      // For agency-specific operations, check if they have access to this specific agency
      if (agencyId) {
        try {
          const [agencyMembership] = await db
            .select()
            .from(agencyAgent)
            .where(
              and(
                eq(agencyAgent.agencyId, agencyId),
                eq(agencyAgent.userId, userId),
                eq(agencyAgent.isActive, true),
              ),
            )
            .limit(1);

          // User must be an active member of this agency
          if (!agencyMembership) {
            sendErrorResponse(res, 403, 'Access denied. You are not a member of this agency.');
          }

          // For write operations, user must be an agency admin
          if (permission === 'AGENCY_WRITE' && agencyMembership.role !== 'ADMIN') {
            sendErrorResponse(
              res,
              403,
              'Access denied. Only agency admins can perform this action.',
            );
          }
        } catch (error) {
          sendErrorResponse(
            res,
            500,
            `Failed to verify agency access: ${(error as Error).message}`,
          );
        }
      }
      next();
      return;
    }

    sendErrorResponse(res, 403, `Access denied. Required permission: ${permission}`);
  };
}

// Convenience middlewares for common patterns
export const userMiddleware = {
  canRead: requirePermission('USER_READ'),
  canWrite: requirePermission('USER_WRITE'),
  canDelete: requirePermission('USER_DELETE'),
  canActivate: requirePermission('USER_ACTIVATE'),
  canDeactivate: requirePermission('USER_DEACTIVATE'),
};

export const propertyMiddleware = {
  canRead: requirePermission('PROPERTY_READ'),
  canWrite: requirePermission('PROPERTY_WRITE'),
  canDelete: requirePermission('PROPERTY_DELETE'),
  canApprove: requirePermission('PROPERTY_APPROVE'),
  canModerate: requireAnyPermission(['PROPERTY_MODERATE', 'ADMIN_ACCESS']),
};

export const agencyMiddleware = {
  canRead: requirePermission('AGENCY_READ'),
  canWrite: requirePermission('AGENCY_WRITE'),
  canDelete: requirePermission('AGENCY_DELETE'),
  canVerify: requirePermission('AGENCY_VERIFY'),
  // Agency creators and admins can manage their agencies
  canManageAgency: requireAnyPermission(['AGENCY_WRITE', 'ADMIN_ACCESS']),
};

export const adminMiddleware = {
  requireAdmin: requirePermission('ADMIN_ACCESS'),
  requireSystemConfig: requirePermission('SYSTEM_CONFIG'),
  requireAuditAccess: requirePermission('AUDIT_LOG_READ'),
};
