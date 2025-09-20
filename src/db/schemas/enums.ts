import { pgEnum } from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ['USER', 'ADMIN']);

// Agency related enums
export const agencyRole = pgEnum('agencyRole', ['AGENCY_ADMIN', 'AGENT']);

// Property related enums
export const propertyType = pgEnum('propertyType', [
  'HOUSE',
  'APARTMENT',
  'CONDO',
  'TOWNHOUSE',
  'VILLA',
  'STUDIO',
  'LAND',
  'COMMERCIAL',
  'OTHER',
]);

export const listingType = pgEnum('listingType', ['SALE', 'RENT']);

export const country = pgEnum('country', ['SOMALIA', 'KENYA']);

export const priceType = pgEnum('priceType', ['FIXED', 'NEGOTIABLE', 'AUCTION', 'FROM']);

export const rentFrequency = pgEnum('rentFrequency', [
  'DAILY',
  'WEEKLY',
  'FORTNIGHTLY',
  'MONTHLY',
  'YEARLY',
]);

export const propertyStatus = pgEnum('propertyStatus', [
  'PENDING',
  'AVAILABLE',
  'REJECTED',
  'SOLD',
  'LEASED',
  'EXPIRED',
]);

// Media related enums
export const mediaType = pgEnum('mediaType', ['IMAGE', 'VIDEO', 'VIRTUAL_TOUR', 'FLOOR_PLAN']);

// Payment related enums
export const paymentStatus = pgEnum('paymentStatus', [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const paymentMethod = pgEnum('paymentMethod', ['MPESA', 'EVC']);

// Service pricing related enums
export const serviceType = pgEnum('serviceType', [
  'PROPERTY_LISTING',
  'HOTEL_LISTING',
  'FEATURED_PROPERTY',
  'URGENT_LISTING',
]);

export const currency = pgEnum('currency', ['USD', 'KES', 'SOS']);

// Tenant related enums
export const leaseType = pgEnum('leaseType', ['FIXED_TERM', 'PERIODIC', 'MONTH_TO_MONTH']);

export const leaseFrequency = pgEnum('leaseFrequency', ['MONTHLY', 'QUARTERLY', 'YEARLY', 'OTHER']);

export const familyRelationship = pgEnum('familyRelationship', [
  'SPOUSE',
  'CHILD',
  'PARENT',
  'SIBLING',
  'FRIEND',
  'OTHER',
]);

export const documentType = pgEnum('documentType', [
  'ID_CARD',
  'PASSPORT',
  'LEASE_AGREEMENT',
  'EMPLOYMENT_LETTER',
]);

export const inspectionType = pgEnum('inspectionType', [
  'MOVE_IN',
  'ROUTINE',
  'MOVE_OUT',
  'EMERGENCY',
]);

export const maintenanceUrgency = pgEnum('maintenanceUrgency', [
  'LOW',
  'MEDIUM',
  'HIGH',
  'EMERGENCY',
]);

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

// Export enum values for non-database usage (like swagger/validation)
export const roleValues = role.enumValues;
export const agencyRoleValues = agencyRole.enumValues;
export const leaseTypeValues = leaseType.enumValues;
export const leaseFrequencyValues = leaseFrequency.enumValues;
export const familyRelationshipValues = familyRelationship.enumValues;
export const documentTypeValues = documentType.enumValues;
export const inspectionTypeValues = inspectionType.enumValues;
export const maintenanceUrgencyValues = maintenanceUrgency.enumValues;
export const propertyTypeValues = propertyType.enumValues;
export const listingTypeValues = listingType.enumValues;
export const countryValues = country.enumValues;
export const priceTypeValues = priceType.enumValues;
export const rentFrequencyValues = rentFrequency.enumValues;
export const propertyStatusValues = propertyStatus.enumValues;
export const mediaTypeValues = mediaType.enumValues;
export const paymentStatusValues = paymentStatus.enumValues;
export const paymentMethodValues = paymentMethod.enumValues;
export const serviceTypeValues = serviceType.enumValues;
export const currencyValues = currency.enumValues;
export const permissionValues = permission.enumValues;

// Type definitions
export type Role = (typeof role.enumValues)[number];
export type AgencyRole = (typeof agencyRole.enumValues)[number];
export type LeaseType = (typeof leaseType.enumValues)[number];
export type LeaseFrequency = (typeof leaseFrequency.enumValues)[number];
export type FamilyRelationship = (typeof familyRelationship.enumValues)[number];
export type DocumentType = (typeof documentType.enumValues)[number];
export type InspectionType = (typeof inspectionType.enumValues)[number];
export type MaintenanceUrgency = (typeof maintenanceUrgency.enumValues)[number];
export type PropertyType = (typeof propertyType.enumValues)[number];
export type ListingType = (typeof listingType.enumValues)[number];
export type Country = (typeof country.enumValues)[number];
export type PriceType = (typeof priceType.enumValues)[number];
export type RentFrequency = (typeof rentFrequency.enumValues)[number];
export type PropertyStatus = (typeof propertyStatus.enumValues)[number];
export type MediaType = (typeof mediaType.enumValues)[number];
export type PaymentStatus = (typeof paymentStatus.enumValues)[number];
export type PaymentMethod = (typeof paymentMethod.enumValues)[number];
export type ServiceType = (typeof serviceType.enumValues)[number];
export type Currency = (typeof currency.enumValues)[number];
export type Permission = (typeof permission.enumValues)[number];
