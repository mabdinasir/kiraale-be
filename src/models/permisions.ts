import type { permission, role } from '@db';

export type Role = (typeof role.enumValues)[number];
export type Permission = (typeof permission.enumValues)[number];

export interface PermissionSet {
  users: Permission[];
  properties: Permission[];
  agencies: Permission[];
  payments: Permission[];
  content: Permission[];
  analytics: Permission[];
  admin: Permission[];
}

export interface RoleDefinition {
  name: Role;
  description: string;
  permissions: Permission[];
  inheritsFrom?: Role[];
}
