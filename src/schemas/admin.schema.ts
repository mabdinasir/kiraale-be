import { z } from 'zod';

// Admin property approval/rejection schemas
export const approvePropertyParamsSchema = z.object({
  id: z.uuid(),
});

export const approvePropertyBodySchema = z.object({
  adminNotes: z.string().optional(),
});

export const rejectPropertyParamsSchema = z.object({
  id: z.uuid(),
});

export const rejectPropertyBodySchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
  adminNotes: z.string().optional(),
});

export const getPendingPropertiesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type ApprovePropertyParams = z.infer<typeof approvePropertyParamsSchema>;
export type ApprovePropertyBody = z.infer<typeof approvePropertyBodySchema>;
export type RejectPropertyParams = z.infer<typeof rejectPropertyParamsSchema>;
export type RejectPropertyBody = z.infer<typeof rejectPropertyBodySchema>;
export type GetPendingPropertiesQuery = z.infer<typeof getPendingPropertiesSchema>;
