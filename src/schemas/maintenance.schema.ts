import { z } from 'zod';

// Maintenance schemas
export const createMaintenanceSchema = z
  .object({
    propertyId: z.uuid('Invalid property ID format'),
    tenantId: z.uuid('Invalid tenant ID format').optional(),
    issue: z.string().min(5, 'Issue description must be at least 5 characters').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
    reportedDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid reported date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str)),
  })
  .strict();

export const updateMaintenanceSchema = z
  .object({
    issue: z.string().min(5, 'Issue description must be at least 5 characters').max(100).optional(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000)
      .optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).optional(),
    assignedTo: z.string().max(100).optional(),
    startedDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid started date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    completedDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid completed date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    cost: z.coerce.number().positive('Cost must be greater than 0').optional(),
    isFixed: z.boolean().optional(),
    warrantyExpiry: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid warranty expiry date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    contractorName: z.string().max(100).optional(),
    contractorPhone: z.string().max(20).optional(),
    notes: z.string().max(1000).optional(),
  })
  .partial()
  .strict();

export const getMaintenanceHistorySchema = z
  .object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
    isFixed: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

export const searchMaintenanceSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    search: z.string().min(1).max(100).optional(),
  })
  .strict();

export const maintenanceIdSchema = z
  .object({
    id: z.uuid('Invalid maintenance ID format'),
  })
  .strict();

// Type exports
export type CreateMaintenanceData = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceData = z.infer<typeof updateMaintenanceSchema>;
export type GetMaintenanceHistoryQuery = z.infer<typeof getMaintenanceHistorySchema>;
export type SearchMaintenanceQuery = z.infer<typeof searchMaintenanceSchema>;
