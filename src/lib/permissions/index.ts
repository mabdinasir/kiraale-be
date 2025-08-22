// Main exports for the permissions system
export type * from '@models/permisions';
export * from './checker';
export * from './constants';
export * from './middleware';
export * from './roles';

// Re-export for convenience
export {
  adminPermissions,
  agencyPermissions,
  canAccessResource,
  canModifyResource,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  paymentPermissions,
  propertyPermissions,
  userPermissions,
} from './checker';

export {
  adminMiddleware,
  propertyMiddleware,
  requireAllPermissions,
  requireAnyPermission,
  requirePermission,
  requireResourceAccess,
  userMiddleware,
} from './middleware';

export { getRolePermissions, isHigherRole, roleDefinitions, roleHasPermission } from './roles';

export { allPermissions, permissions } from './constants';
