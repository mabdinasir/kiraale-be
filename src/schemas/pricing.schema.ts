import { currencyValues, serviceTypeValues } from '@db/schemas/enums';
import { z } from 'zod';

// Pricing query schemas
export const getPricingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  serviceType: z.enum(serviceTypeValues).optional(),
  active: z.coerce.boolean().optional(),
});

export const getServicePriceParamsSchema = z.object({
  serviceType: z.enum(serviceTypeValues),
});

// Admin pricing management schemas
export const createPricingSchema = z.object({
  serviceType: z.enum(serviceTypeValues),
  serviceName: z.string().min(1, 'Service name is required').max(255, 'Service name too long'),
  amount: z.number().min(0, 'Amount cannot be negative'),
  currency: z.enum(currencyValues).default('USD'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const updatePricingSchema = z.object({
  serviceName: z
    .string()
    .min(1, 'Service name is required')
    .max(255, 'Service name too long')
    .optional(),
  amount: z.number().min(0, 'Amount cannot be negative').optional(),
  currency: z.enum(currencyValues).optional(),
  description: z.string().max(500, 'Description too long').optional(),
  active: z.boolean().optional(),
});

export const pricingParamsSchema = z.object({
  id: z.uuid('Invalid pricing ID'),
});

// Type exports
export type GetPricingQuery = z.infer<typeof getPricingQuerySchema>;
export type GetServicePriceParams = z.infer<typeof getServicePriceParamsSchema>;
export type CreatePricing = z.infer<typeof createPricingSchema>;
export type UpdatePricing = z.infer<typeof updatePricingSchema>;
export type PricingParams = z.infer<typeof pricingParamsSchema>;
