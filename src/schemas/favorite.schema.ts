import { z } from 'zod';

// Favorite management schemas
export const addToFavoritesSchema = z.object({
  propertyId: z.uuid(),
});

export const removeFromFavoritesParamsSchema = z.object({
  propertyId: z.uuid(),
});

export const getMyFavoritesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const getMyPropertiesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export type AddToFavoritesBody = z.infer<typeof addToFavoritesSchema>;
export type RemoveFromFavoritesParams = z.infer<typeof removeFromFavoritesParamsSchema>;
export type GetMyFavoritesQuery = z.infer<typeof getMyFavoritesSchema>;
export type GetMyPropertiesQuery = z.infer<typeof getMyPropertiesSchema>;
