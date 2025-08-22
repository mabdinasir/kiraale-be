import type { Permission, PermissionSet } from '@models/permisions';

// Organize permissions by domain for better management
export const permissions: PermissionSet = {
  users: ['USER_READ', 'USER_WRITE', 'USER_DELETE', 'USER_ACTIVATE', 'USER_DEACTIVATE'],

  properties: [
    'PROPERTY_READ',
    'PROPERTY_WRITE',
    'PROPERTY_DELETE',
    'PROPERTY_APPROVE',
    'PROPERTY_REJECT',
    'PROPERTY_FEATURE',
    'PROPERTY_MODERATE',
  ],

  agencies: ['AGENCY_READ', 'AGENCY_WRITE', 'AGENCY_DELETE', 'AGENCY_VERIFY'],

  payments: ['PAYMENT_READ', 'PAYMENT_PROCESS', 'PAYMENT_REFUND'],

  content: ['CONTENT_MODERATE', 'CONTENT_DELETE', 'CONTENT_APPROVE'],

  analytics: ['ANALYTICS_READ', 'REPORT_GENERATE'],

  admin: ['ADMIN_ACCESS', 'SYSTEM_CONFIG', 'AUDIT_LOG_READ'],
};

// Flatten all permissions for easy access
export const allPermissions: Permission[] = Object.values(permissions).flat();
