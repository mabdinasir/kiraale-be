import { z } from 'zod';

// Inspection schemas
export const createInspectionSchema = z
  .object({
    propertyId: z.uuid('Invalid property ID format'),
    tenantId: z.uuid('Invalid tenant ID format').optional(),
    inspectionDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid inspection date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str)),
    inspectionType: z.enum(['MOVE_IN', 'ROUTINE', 'MOVE_OUT', 'EMERGENCY']),
    notes: z.string().min(10, 'Inspection notes must be at least 10 characters').max(2000),
    overallRating: z.number().int().min(1).max(5),
    inspectedBy: z.string().min(2, 'Inspector name must be at least 2 characters').max(100),
  })
  .strict();

export const updateInspectionSchema = createInspectionSchema
  .omit({ propertyId: true })
  .partial()
  .strict();

export const searchInspectionsSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    search: z.string().min(1).max(100).optional(),
  })
  .strict();

export const inspectionIdSchema = z
  .object({
    id: z.uuid('Invalid inspection ID format'),
  })
  .strict();

// Type exports
export type CreateInspectionData = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionData = z.infer<typeof updateInspectionSchema>;
export type SearchInspectionsQuery = z.infer<typeof searchInspectionsSchema>;
