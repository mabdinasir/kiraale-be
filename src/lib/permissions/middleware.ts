import type { Permission } from '@models/permisions';
import type { Request, RequestHandler } from 'express';
import { hasAllPermissions, hasAnyPermission, hasPermission } from './checker';

// Generic permission middleware
export function requirePermission(requiredPermission: Permission): RequestHandler {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!hasPermission(userRole, requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${requiredPermission}`,
      });
    }

    next();
    return null;
  };
}

// Require any of the specified permissions
export function requireAnyPermission(requiredPermissions: Permission[]): RequestHandler {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!hasAnyPermission(userRole, requiredPermissions)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required one of: ${requiredPermissions.join(', ')}`,
      });
    }

    next();
    return null;
  };
}

// Require all of the specified permissions
export function requireAllPermissions(requiredPermissions: Permission[]): RequestHandler {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!hasAllPermissions(userRole, requiredPermissions)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required all of: ${requiredPermissions.join(', ')}`,
      });
    }

    next();
    return null;
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
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const resourceOwnerId = getResourceOwnerId(req);

    // If user owns the resource, allow access
    if (userId === resourceOwnerId) {
      next();
      return null;
    }

    // Otherwise check if they have the fallback permission
    if (!hasPermission(userRole, fallbackPermission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${fallbackPermission} or resource ownership`,
      });
    }

    next();
    return null;
  };
}

// Agency-specific permission checker
export function requireAgencyAccess(permission: Permission): RequestHandler {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const agencyId = req.params.id || req.params.agencyId;

    if (!userRole || !userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Admins can access everything
    if (hasPermission(userRole, 'ADMIN_ACCESS')) {
      next();
      return null;
    }

    // Check if user has the general permission
    if (hasPermission(userRole, permission)) {
      // For agency-specific operations, check if they have access to this agency
      if (agencyId) {
        // TODO: Add database check to see if user is owner/admin of this agency
        // For now, we'll implement basic permission checking
      }
      next();
      return null;
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Required permission: ${permission}`,
    });
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
