import { z } from 'zod';

// Favorite management schemas
export const addToFavoritesSchema = z.object({
  propertyId: z.uuid(),
});

export const removeFromFavoritesParamsSchema = z.object({
  propertyId: z.uuid(),
});

export const getMyFavoritesSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
});

export type AddToFavoritesBody = z.infer<typeof addToFavoritesSchema>;
export type RemoveFromFavoritesParams = z.infer<typeof removeFromFavoritesParamsSchema>;
export type GetMyFavoritesQuery = z.infer<typeof getMyFavoritesSchema>;
