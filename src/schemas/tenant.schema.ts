/* eslint-disable max-lines */
import { z } from 'zod';

// Tenant schemas
export const createTenantSchema = z
  .object({
    propertyId: z.uuid('Invalid property ID format'),
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    email: z.email('Invalid email format'),
    mobile: z.string().min(8, 'Mobile number must be at least 8 characters').max(20),
    nationalId: z.string().max(50).optional(),
    passportNumber: z.string().max(50).optional(),
    emergencyContactName: z
      .string()
      .min(2, 'Emergency contact name must be at least 2 characters')
      .max(100),
    emergencyContactPhone: z
      .string()
      .min(8, 'Emergency contact phone must be at least 8 characters')
      .max(20),
    leaseType: z.enum(['FIXED_TERM', 'PERIODIC', 'MONTH_TO_MONTH']),
    leaseFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'OTHER']),
    rentAmount: z.coerce.number().positive('Rent amount must be greater than 0'),
    leaseStartDate: z.string().min(1, 'Lease start date is required'),
    leaseEndDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // For MONTH_TO_MONTH leases, end date is optional
      if (data.leaseType === 'MONTH_TO_MONTH') {
        return true;
      }
      // For FIXED_TERM and PERIODIC leases, end date is required
      if (data.leaseType === 'FIXED_TERM' || data.leaseType === 'PERIODIC') {
        if (!data.leaseEndDate || data.leaseEndDate.trim() === '') {
          return false;
        }
        // End date must be after start date
        if (new Date(data.leaseStartDate) >= new Date(data.leaseEndDate)) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Fixed term and periodic leases require an end date that is after the start date',
      path: ['leaseEndDate'],
    },
  )
  .strict();

export const updateTenantSchema = createTenantSchema.omit({ propertyId: true }).partial().strict();

export const endTenantLeaseSchema = z
  .object({
    leaseEndDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid lease end date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str)),
    leaseEndReason: z.string().min(5, 'Lease end reason must be at least 5 characters').max(500),
    leaseEndNotes: z.string().max(500).optional(),
  })
  .strict();

// Family member schemas
export const createFamilyMemberSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    email: z.email('Invalid email format').optional(),
    mobile: z.string().min(8, 'Mobile number must be at least 8 characters').max(20).optional(),
    relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'FRIEND', 'OTHER']),
    age: z.number().int().min(0).max(120),
    nationalId: z.string().max(50).optional(),
    isMinor: z.boolean().default(false),
  })
  .strict();

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial().strict();

// Deposit schemas
export const recordDepositSchema = z
  .object({
    amount: z.coerce.number().positive('Deposit amount must be greater than 0'),
    paidDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid paid date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str)),
    receiptNumber: z.string().min(1, 'Receipt number is required').max(100),
  })
  .strict();

export const refundDepositSchema = z
  .object({
    refundAmount: z.coerce.number().positive('Refund amount must be greater than 0'),
    refundDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid refund date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str)),
    refundReason: z.string().min(5, 'Refund reason must be at least 5 characters').max(500),
  })
  .strict();

export const updateDepositSchema = z
  .object({
    amount: z.coerce.number().positive('Deposit amount must be greater than 0').optional(),
    paidDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid paid date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    receiptNumber: z.string().min(1, 'Receipt number is required').max(100).optional(),
    refundAmount: z.coerce.number().positive('Refund amount must be greater than 0').optional(),
    refundDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid refund date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    refundReason: z
      .string()
      .min(5, 'Refund reason must be at least 5 characters')
      .max(500)
      .optional(),
    isRefunded: z.boolean().optional(),
  })
  .partial()
  .strict();

// Rent payment schemas
export const recordRentPaymentSchema = z
  .object({
    amount: z.coerce.number().positive('Payment amount must be greater than 0'),
    paidDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid paid date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str)),
    receiptNumber: z.string().min(1, 'Receipt number is required').max(100),
    paymentMethod: z.string().min(2, 'Payment method is required').max(50),
    paymentPeriodStart: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid payment period start date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str)),
    paymentPeriodEnd: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid payment period end date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str)),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.paymentPeriodStart >= data.paymentPeriodEnd) {
        return false;
      }
      return true;
    },
    {
      message: 'Payment period end must be after start',
      path: ['paymentPeriodEnd'],
    },
  )
  .strict();

export const updateRentPaymentSchema = z
  .object({
    amount: z.coerce.number().positive('Payment amount must be greater than 0').optional(),
    paidDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid paid date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    receiptNumber: z.string().min(1, 'Receipt number is required').max(100).optional(),
    paymentMethod: z.string().min(2, 'Payment method is required').max(50).optional(),
    paymentPeriodStart: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid payment period start date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    paymentPeriodEnd: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid payment period end date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    isPaid: z.boolean().optional(),
    notes: z.string().max(500).optional(),
  })
  .partial()
  .strict();

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

// Document schemas
export const uploadTenantDocumentSchema = z
  .object({
    documentType: z.enum(['ID_CARD', 'PASSPORT', 'LEASE_AGREEMENT', 'EMPLOYMENT_LETTER']),
    fileName: z.string().min(1, 'File name is required'),
    fileSize: z.number().positive('File size must be greater than 0'),
    mimeType: z.string().min(1, 'MIME type is required'),
    url: z.url('Invalid URL format'),
    expiryDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid expiry date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
  })
  .strict();

// Tenant document file upload validation schema
export const tenantDocumentFileUploadSchema = z
  .object({
    fileType: z.string().refine(
      (type) => {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        return allowedTypes.includes(type);
      },
      {
        message: 'Only PDF, Word documents, and images (JPEG, PNG) are allowed',
      },
    ),
    fileSize: z
      .number()
      .max(10 * 1024 * 1024, 'File size cannot exceed 10MB')
      .positive('File size must be greater than 0'),
    checksum: z.string().min(1, 'File checksum is required'),
    tenantId: z.uuid('Invalid tenant ID format'),
    documentType: z.enum(['ID_CARD', 'PASSPORT', 'LEASE_AGREEMENT', 'EMPLOYMENT_LETTER']),
    expiryDate: z.date().optional(),
  })
  .strict();

export const updateTenantDocumentSchema = z
  .object({
    documentType: z
      .enum(['ID_CARD', 'PASSPORT', 'LEASE_AGREEMENT', 'EMPLOYMENT_LETTER'])
      .optional(),
    fileName: z.string().min(1, 'File name is required').optional(),
    fileSize: z.number().positive('File size must be greater than 0').optional(),
    mimeType: z.string().min(1, 'MIME type is required').optional(),
    url: z.url('Invalid URL format').optional(),
    expiryDate: z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'Invalid expiry date format. Use YYYY-MM-DD or ISO format.',
      })
      .transform((str) => new Date(str))
      .optional(),
    isActive: z.boolean().optional(),
  })
  .partial()
  .strict();

// Query schemas
export const getTenantsSchema = z
  .object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

export const getPaymentHistorySchema = z
  .object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
    year: z.string().transform(Number).pipe(z.number().int().min(2020)).optional(),
  })
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

// Additional query schemas
export const getMyTenantsSchema = z
  .object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

export const getDepositsSchema = z
  .object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
    isRefunded: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

export const getFamilyMembersSchema = z
  .object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
  })
  .strict();

export const getTenantDocumentsSchema = z
  .object({
    documentType: z
      .enum(['ID_CARD', 'PASSPORT', 'LEASE_AGREEMENT', 'EMPLOYMENT_LETTER'])
      .optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

// Search schemas for UI
export const searchTenantsSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    search: z.string().min(1).max(100).optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  })
  .strict();

export const searchMyPropertiesSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    search: z.string().min(1).max(100).optional(),
  })
  .strict();

// Common ID schemas
export const tenantIdSchema = z
  .object({
    id: z.uuid('Invalid tenant ID format'),
  })
  .strict();

export const propertyIdSchema = z
  .object({
    id: z.uuid('Invalid property ID format'),
  })
  .strict();

export const inspectionIdSchema = z
  .object({
    id: z.uuid('Invalid inspection ID format'),
  })
  .strict();

export const maintenanceIdSchema = z
  .object({
    id: z.uuid('Invalid maintenance ID format'),
  })
  .strict();

export const familyMemberIdSchema = z
  .object({
    id: z.uuid('Invalid family member ID format'),
  })
  .strict();

export const depositIdSchema = z
  .object({
    id: z.uuid('Invalid deposit ID format'),
  })
  .strict();

export const documentIdSchema = z
  .object({
    id: z.uuid('Invalid document ID format'),
  })
  .strict();

// Type exports
export type CreateTenantData = z.infer<typeof createTenantSchema>;
export type UpdateTenantData = z.infer<typeof updateTenantSchema>;
export type EndTenantLeaseData = z.infer<typeof endTenantLeaseSchema>;
export type CreateFamilyMemberData = z.infer<typeof createFamilyMemberSchema>;
export type UpdateFamilyMemberData = z.infer<typeof updateFamilyMemberSchema>;
export type RecordDepositData = z.infer<typeof recordDepositSchema>;
export type RefundDepositData = z.infer<typeof refundDepositSchema>;
export type UpdateDepositData = z.infer<typeof updateDepositSchema>;
export type RecordRentPaymentData = z.infer<typeof recordRentPaymentSchema>;
export type UpdateRentPaymentData = z.infer<typeof updateRentPaymentSchema>;
export type UpdateTenantDocumentData = z.infer<typeof updateTenantDocumentSchema>;
export type CreateInspectionData = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionData = z.infer<typeof updateInspectionSchema>;
export type CreateMaintenanceData = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceData = z.infer<typeof updateMaintenanceSchema>;
export type UploadTenantDocumentData = z.infer<typeof uploadTenantDocumentSchema>;
export type GetTenantsQuery = z.infer<typeof getTenantsSchema>;
export type GetPaymentHistoryQuery = z.infer<typeof getPaymentHistorySchema>;
export type GetMaintenanceHistoryQuery = z.infer<typeof getMaintenanceHistorySchema>;
export type GetMyTenantsQuery = z.infer<typeof getMyTenantsSchema>;
export type GetDepositsQuery = z.infer<typeof getDepositsSchema>;
export type GetFamilyMembersQuery = z.infer<typeof getFamilyMembersSchema>;
export type GetTenantDocumentsQuery = z.infer<typeof getTenantDocumentsSchema>;
export type SearchTenantsQuery = z.infer<typeof searchTenantsSchema>;
export type SearchMyPropertiesQuery = z.infer<typeof searchMyPropertiesSchema>;
