import type { Permission, Role } from '@models';
import { isHigherRole, roleHasPermission } from './roles';

// Main permission checker function
export function hasPermission(userRole: Role, requiredPermission: Permission): boolean {
  return roleHasPermission(userRole, requiredPermission);
}

// Check if user has any of the required permissions
export function hasAnyPermission(userRole: Role, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some((permission) => hasPermission(userRole, permission));
}

// Check if user has all required permissions
export function hasAllPermissions(userRole: Role, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every((permission) => hasPermission(userRole, permission));
}

// Check if user can access resource based on ownership
export function canAccessResource(
  userRole: Role,
  userId: string,
  resourceOwnerId: string | null,
  requiredPermission: Permission,
): boolean {
  // If user owns the resource, allow access
  if (userId === resourceOwnerId) {
    return true;
  }

  // Otherwise check if they have the required permission
  return hasPermission(userRole, requiredPermission);
}

// Check if user can modify resource based on ownership and role hierarchy
export function canModifyResource(
  userRole: Role,
  userId: string,
  resourceOwnerId: string | null,
  resourceOwnerRole: Role | null,
  requiredPermission: Permission,
): boolean {
  // If user owns the resource, allow modification
  if (userId === resourceOwnerId) {
    return true;
  }

  // If user has the required permission and higher role than resource owner
  if (hasPermission(userRole, requiredPermission)) {
    if (!resourceOwnerRole || isHigherRole(userRole, resourceOwnerRole)) {
      return true;
    }
  }

  return false;
}

// Domain-specific permission checkers
export const userPermissions = {
  canRead: (userRole: Role) => hasPermission(userRole, 'USER_READ'),
  canWrite: (userRole: Role) => hasPermission(userRole, 'USER_WRITE'),
  canDelete: (userRole: Role) => hasPermission(userRole, 'USER_DELETE'),
  canActivate: (userRole: Role) => hasPermission(userRole, 'USER_ACTIVATE'),
  canDeactivate: (userRole: Role) => hasPermission(userRole, 'USER_DEACTIVATE'),
};

export const propertyPermissions = {
  canRead: (userRole: Role) => hasPermission(userRole, 'PROPERTY_READ'),
  canWrite: (userRole: Role) => hasPermission(userRole, 'PROPERTY_WRITE'),
  canDelete: (userRole: Role) => hasPermission(userRole, 'PROPERTY_DELETE'),
  canApprove: (userRole: Role) => hasPermission(userRole, 'PROPERTY_APPROVE'),
  canReject: (userRole: Role) => hasPermission(userRole, 'PROPERTY_REJECT'),
  canFeature: (userRole: Role) => hasPermission(userRole, 'PROPERTY_FEATURE'),
  canModerate: (userRole: Role) => hasPermission(userRole, 'PROPERTY_MODERATE'),
};

export const agencyPermissions = {
  canRead: (userRole: Role) => hasPermission(userRole, 'AGENCY_READ'),
  canWrite: (userRole: Role) => hasPermission(userRole, 'AGENCY_WRITE'),
  canDelete: (userRole: Role) => hasPermission(userRole, 'AGENCY_DELETE'),
  canVerify: (userRole: Role) => hasPermission(userRole, 'AGENCY_VERIFY'),
};

export const paymentPermissions = {
  canRead: (userRole: Role) => hasPermission(userRole, 'PAYMENT_READ'),
  canProcess: (userRole: Role) => hasPermission(userRole, 'PAYMENT_PROCESS'),
  canRefund: (userRole: Role) => hasPermission(userRole, 'PAYMENT_REFUND'),
};

export const adminPermissions = {
  canAccess: (userRole: Role) => hasPermission(userRole, 'ADMIN_ACCESS'),
  canConfigureSystem: (userRole: Role) => hasPermission(userRole, 'SYSTEM_CONFIG'),
  canReadAuditLogs: (userRole: Role) => hasPermission(userRole, 'AUDIT_LOG_READ'),
};
