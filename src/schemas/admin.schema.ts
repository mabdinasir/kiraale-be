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
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const getRejectedPropertiesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// Get payments schema for admin
export const getPaymentsSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10)),
  limit: z
    .string()
    .optional()
    .default('50')
    .transform((val) => parseInt(val, 10)),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
  method: z.enum(['MPESA', 'EVC']).optional(),
  search: z.string().optional(),
  propertyId: z.string().optional(),
});

export const getPaymentByIdSchema = z.object({
  paymentId: z.uuid('Invalid payment ID'),
});

// Admin user management schemas
export const adminSearchUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  isActive: z.coerce.boolean().optional(),
  isSuspended: z.coerce.boolean().optional(),
});

export const adminSuspendUserSchema = z.object({
  userId: z.uuid('Invalid user ID'),
});

export const adminSuspendUserBodySchema = z.object({
  isSuspended: z.boolean(),
  suspensionReason: z
    .string()
    .min(10, 'Suspension reason must be at least 10 characters')
    .optional(),
});

export type ApprovePropertyParams = z.infer<typeof approvePropertyParamsSchema>;
export type ApprovePropertyBody = z.infer<typeof approvePropertyBodySchema>;
export type RejectPropertyParams = z.infer<typeof rejectPropertyParamsSchema>;
export type RejectPropertyBody = z.infer<typeof rejectPropertyBodySchema>;
export type GetPendingPropertiesQuery = z.infer<typeof getPendingPropertiesSchema>;
export type AdminGetPaymentsQuery = z.infer<typeof getPaymentsSchema>;
export type GetPaymentByIdParams = z.infer<typeof getPaymentByIdSchema>;
export type AdminSearchUsersQuery = z.infer<typeof adminSearchUsersSchema>;
export type AdminSuspendUserParams = z.infer<typeof adminSuspendUserSchema>;
export type AdminSuspendUserBody = z.infer<typeof adminSuspendUserBodySchema>;
