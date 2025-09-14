import { insertUserSchema, selectUserSchema } from '@db/schemas';
import { allowedImageTypes, maxFileSize, maxFileSizeMB } from '@lib/config/fileUpload';
import { z } from 'zod';

export const getUserByIdSchema = selectUserSchema
  .pick({
    id: true,
  })
  .strict();

export const updateUserSchema = insertUserSchema
  .pick({
    firstName: true,
    lastName: true,
    email: true,
    nationalId: true,
    passportNumber: true,
    mobile: true,
    hasAcceptedTnC: true,
    isActive: true,
    profilePicture: true,
    bio: true,
    address: true,
    agentNumber: true,
  })
  .partial()
  .extend({
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    address: z.string().max(200, 'Address cannot exceed 200 characters').optional(),
    mobile: z
      .string()
      .min(10, 'Mobile number must be at least 10 digits')
      .max(15, 'Mobile number cannot exceed 15 digits')
      .optional(),
  })
  .strict();

export const deleteParamsSchema = selectUserSchema
  .pick({
    id: true,
  })
  .strict();

export const deactivateParamsSchema = selectUserSchema
  .pick({
    id: true,
  })
  .strict();

// Profile picture upload schema
export const profilePicUploadSchema = z.object({
  fileType: z.string().refine((type) => allowedImageTypes.includes(type), {
    message: 'Invalid file type. Only JPEG, PNG, GIF images are allowed',
  }),
  fileSize: z.number().max(maxFileSize, {
    message: `File size cannot exceed ${maxFileSizeMB}MB`,
  }),
  checksum: z.string().min(1, {
    message: 'Checksum is required',
  }),
});

// Get users query schema for admin/pagination
export const getUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    role: z.enum(['USER', 'ADMIN', 'AGENT']).optional(),
  })
  .optional();

// Password validation schema matching auth.schema.ts
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/u,
    'Password must contain at least one uppercase, lowercase, number, and special character',
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  })
  .strict();

// Admin user update schema - for critical fields only
export const adminUpdateUserSchema = insertUserSchema
  .pick({
    firstName: true,
    lastName: true,
    role: true,
    nationalId: true,
    passportNumber: true,
    isActive: true,
    agentNumber: true,
    email: true,
    mobile: true,
    address: true,
  })
  .partial()
  .extend({
    mobile: z
      .string()
      .min(10, 'Mobile number must be at least 10 digits')
      .max(15, 'Mobile number cannot exceed 15 digits')
      .optional(),
    email: z.email('Invalid email format').optional(),
    address: z.string().max(200, 'Address cannot exceed 200 characters').optional(),
  })
  .strict();

export const adminUpdateUserParamsSchema = selectUserSchema
  .pick({
    id: true,
  })
  .strict();

export type GetUserByIdParams = z.infer<typeof getUserByIdSchema>;
export type GetUsersQueryParams = z.infer<typeof getUsersQuerySchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type DeleteParams = z.infer<typeof deleteParamsSchema>;
export type DeactivateParams = z.infer<typeof deactivateParamsSchema>;
export type ProfilePicUploadData = z.infer<typeof profilePicUploadSchema>;
export type AdminUpdateUserData = z.infer<typeof adminUpdateUserSchema>;
export type AdminUpdateUserParams = z.infer<typeof adminUpdateUserParamsSchema>;
