import {
  countryValues,
  listingTypeValues,
  priceTypeValues,
  propertyStatusValues,
  propertyTypeValues,
  rentFrequencyValues,
} from '@db/schemas/enums';
import { z } from 'zod';

export const propertySearchSchema = z
  .object({
    // Pagination
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),

    // Text search
    search: z.string().trim().min(1).optional(),

    // Core filters
    propertyType: z.enum(propertyTypeValues).optional(),
    listingType: z.enum(listingTypeValues).optional(),
    status: z.enum(propertyStatusValues).optional(),
    country: z.enum(countryValues).optional(),

    // Price filters
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    priceType: z.enum(priceTypeValues).optional(),
    rentFrequency: z.enum(rentFrequencyValues).optional(),

    // Size and space filters
    minBedrooms: z.coerce.number().int().nonnegative().optional(),
    maxBedrooms: z.coerce.number().int().nonnegative().optional(),
    minBathrooms: z.coerce.number().int().nonnegative().optional(),
    maxBathrooms: z.coerce.number().int().nonnegative().optional(),
    minParkingSpaces: z.coerce.number().int().nonnegative().optional(),
    maxParkingSpaces: z.coerce.number().int().nonnegative().optional(),
    minLandSize: z.coerce.number().int().nonnegative().optional(),
    maxLandSize: z.coerce.number().int().nonnegative().optional(),
    minFloorArea: z.coerce.number().int().nonnegative().optional(),
    maxFloorArea: z.coerce.number().int().nonnegative().optional(),

    // Property features
    hasAirConditioning: z.coerce.boolean().optional(),

    // Location search
    address: z.string().trim().min(1).optional(),

    // Date filters
    availableFrom: z.iso.datetime({ offset: true }).optional(),
    createdAfter: z.iso.datetime({ offset: true }).optional(),
    createdBefore: z.iso.datetime({ offset: true }).optional(),

    // User filters
    userId: z.uuid().optional(),

    // Sorting options
    sortBy: z
      .enum([
        'createdAt',
        'updatedAt',
        'price',
        'bedrooms',
        'bathrooms',
        'landSize',
        'floorArea',
        'views', // For when view tracking is implemented
      ])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
        return false;
      }
      if (data.minBedrooms && data.maxBedrooms && data.minBedrooms > data.maxBedrooms) {
        return false;
      }
      if (data.minBathrooms && data.maxBathrooms && data.minBathrooms > data.maxBathrooms) {
        return false;
      }
      if (
        data.minParkingSpaces &&
        data.maxParkingSpaces &&
        data.minParkingSpaces > data.maxParkingSpaces
      ) {
        return false;
      }
      if (data.minLandSize && data.maxLandSize && data.minLandSize > data.maxLandSize) {
        return false;
      }
      if (data.minFloorArea && data.maxFloorArea && data.minFloorArea > data.maxFloorArea) {
        return false;
      }
      return true;
    },
    {
      message: 'Min values cannot be greater than max values',
    },
  );

export const recordPropertyViewSchema = z
  .object({
    propertyId: z.uuid(),
    userId: z.uuid().optional(),
    sessionId: z.string().min(1).max(255).optional(),
    userAgent: z.string().max(500).optional(),
    referrer: z.string().max(500).optional(),
  })
  .refine((data) => data.userId ?? data.sessionId, {
    message: 'Either userId or sessionId must be provided',
  });

export const getPropertyAnalyticsParamsSchema = z.object({
  id: z.uuid(),
});

export const getPropertyAnalyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('week'),
  startDate: z.iso.datetime({ offset: true }).optional(),
  endDate: z.iso.datetime({ offset: true }).optional(),
});

export type PropertySearchQuery = z.infer<typeof propertySearchSchema>;
export type RecordPropertyView = z.infer<typeof recordPropertyViewSchema>;
export type GetPropertyAnalyticsParams = z.infer<typeof getPropertyAnalyticsParamsSchema>;
export type GetPropertyAnalyticsQuery = z.infer<typeof getPropertyAnalyticsQuerySchema>;
