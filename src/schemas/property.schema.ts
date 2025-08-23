import { insertPropertySchema, selectPropertySchema } from '@db/schemas';
import { z } from 'zod';

// Import enum schemas from database
import { country, listingType, propertyStatus, propertyType } from '@db/schemas/enums';

// Create property schema using database schema with enhanced validation
export const createPropertySchema = insertPropertySchema
  .pick({
    userId: true,
    title: true,
    description: true,
    propertyType: true,
    listingType: true,
    bedrooms: true,
    bathrooms: true,
    parkingSpaces: true,
    landSize: true,
    floorArea: true,
    hasAirConditioning: true,
    address: true,
    country: true,
    price: true,
    priceType: true,
    rentFrequency: true,
    availableFrom: true,
  })
  .extend({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
    bedrooms: z.number().int().min(0).max(50, 'Bedrooms cannot exceed 50').optional(),
    bathrooms: z.number().int().min(0).max(50, 'Bathrooms cannot exceed 50').optional(),
    parkingSpaces: z.number().int().min(0).max(200, 'Parking spaces cannot exceed 200').optional(),
    landSize: z.number().positive('Land size must be positive').optional(),
    floorArea: z.number().positive('Floor area must be positive').optional(),
    address: z
      .string()
      .min(1, 'Address is required')
      .max(500, 'Address cannot exceed 500 characters'),
    price: z.number().positive('Price must be greater than 0'),
  })
  .strict();

// Update property schema
export const updatePropertySchema = insertPropertySchema
  .pick({
    title: true,
    description: true,
    propertyType: true,
    listingType: true,
    bedrooms: true,
    bathrooms: true,
    parkingSpaces: true,
    landSize: true,
    floorArea: true,
    hasAirConditioning: true,
    address: true,
    country: true,
    price: true,
    priceType: true,
    rentFrequency: true,
    status: true,
    availableFrom: true,
  })
  .extend({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
    bedrooms: z.number().int().min(0).max(50, 'Bedrooms cannot exceed 50').optional(),
    bathrooms: z.number().int().min(0).max(50, 'Bathrooms cannot exceed 50').optional(),
    parkingSpaces: z.number().int().min(0).max(200, 'Parking spaces cannot exceed 200').optional(),
    landSize: z.number().positive('Land size must be positive').optional(),
    floorArea: z.number().positive('Floor area must be positive').optional(),
    address: z
      .string()
      .min(1, 'Address is required')
      .max(500, 'Address cannot exceed 500 characters')
      .optional(),
    price: z.number().positive('Price must be greater than 0').optional(),
  })
  .partial()
  .strict();

// Get property by ID schema
export const getPropertyByIdSchema = selectPropertySchema
  .pick({
    id: true,
  })
  .extend({
    id: z.uuid('Invalid ID format!'),
  })
  .strict();

// Query properties schema
export const queryPropertiesSchema = z
  .object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
    propertyType: z.enum(propertyType.enumValues).optional(),
    listingType: z.enum(listingType.enumValues).optional(),
    country: z.enum(country.enumValues).optional(),
    minPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
    bedrooms: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    bathrooms: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    hasAirConditioning: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
    status: z.enum(propertyStatus.enumValues).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice && data.minPrice >= data.maxPrice) {
        return false;
      }
      return true;
    },
    {
      message: 'Max price must be greater than min price',
      path: ['maxPrice'],
    },
  )
  .strict();

// Delete property schema
export const deletePropertySchema = selectPropertySchema
  .pick({
    id: true,
  })
  .extend({
    id: z.uuid('Invalid ID format!'),
  })
  .strict();

export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
export type GetPropertyByIdParams = z.infer<typeof getPropertyByIdSchema>;
export type QueryPropertiesParams = z.infer<typeof queryPropertiesSchema>;
export type DeletePropertyParams = z.infer<typeof deletePropertySchema>;
