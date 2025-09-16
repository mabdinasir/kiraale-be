import type { Permission, Role, RoleDefinition } from '@models';
import { permissions } from './constants';

// Define role capabilities for the property platform
export const roleDefinitions: Record<Role, RoleDefinition> = {
  USER: {
    name: 'USER',
    description: 'Regular platform users who can browse properties and contact agents',
    permissions: [
      // Basic property browsing
      'PROPERTY_READ',
    ],
  },

  ADMIN: {
    name: 'ADMIN',
    description: 'Platform administrators with full system access',
    permissions: [
      // All user permissions
      ...permissions.users,

      // All property permissions
      ...permissions.properties,

      // All agency permissions
      ...permissions.agencies,

      // All payment permissions
      ...permissions.payments,

      // All content moderation permissions
      ...permissions.content,

      // All analytics permissions
      ...permissions.analytics,

      // All admin permissions
      ...permissions.admin,
    ],
  },
};

// Helper function to get all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  return roleDefinitions[role]?.permissions ?? [];
}

// Helper function to check if a role has a specific permission
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = getRolePermissions(role);
  return rolePermissions.includes(permission);
}

// Helper function to get role hierarchy (for future use)
export function getRoleHierarchy(): Record<Role, number> {
  return {
    USER: 1,
    ADMIN: 2,
  };
}

// Check if one role is higher than another
export function isHigherRole(role1: Role, role2: Role): boolean {
  const hierarchy = getRoleHierarchy();
  return hierarchy[role1] > hierarchy[role2];
}
