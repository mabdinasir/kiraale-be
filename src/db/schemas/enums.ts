import { pgEnum } from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ['USER', 'AGENT', 'ADMIN']);

export const permission = pgEnum('permission', [
  // User management permissions
  'USER_READ',
  'USER_WRITE',
  'USER_DELETE',
  'USER_ACTIVATE',
  'USER_DEACTIVATE',

  // Property management permissions
  'PROPERTY_READ',
  'PROPERTY_WRITE',
  'PROPERTY_DELETE',
  'PROPERTY_APPROVE',
  'PROPERTY_REJECT',
  'PROPERTY_FEATURE',
  'PROPERTY_MODERATE',

  // Media management permissions
  'MEDIA_READ',
  'MEDIA_WRITE',
  'MEDIA_DELETE',

  // Agency management permissions
  'AGENCY_READ',
  'AGENCY_WRITE',
  'AGENCY_DELETE',
  'AGENCY_VERIFY',

  // Financial permissions
  'PAYMENT_READ',
  'PAYMENT_PROCESS',
  'PAYMENT_REFUND',

  // Content moderation permissions
  'CONTENT_MODERATE',
  'CONTENT_DELETE',
  'CONTENT_APPROVE',

  // Analytics and reporting permissions
  'ANALYTICS_READ',
  'REPORT_GENERATE',

  // System administration permissions
  'ADMIN_ACCESS',
  'SYSTEM_CONFIG',
  'AUDIT_LOG_READ',
]);
