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
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    role: z.enum(['USER', 'ADMIN', 'AGENT']).optional(),
  })
  .optional();

export type GetUserByIdParams = z.infer<typeof getUserByIdSchema>;
export type GetUsersQueryParams = z.infer<typeof getUsersQuerySchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type DeleteParams = z.infer<typeof deleteParamsSchema>;
export type DeactivateParams = z.infer<typeof deactivateParamsSchema>;
export type ProfilePicUploadData = z.infer<typeof profilePicUploadSchema>;
