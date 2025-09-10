import { insertMediaSchema, selectMediaSchema } from '@db/schemas';
import { mediaType } from '@db/schemas/enums';
import {
  allowedFileTypes,
  maxFileSize,
  maxFileSizeMB,
  maxPropertyMediaFiles,
} from '@lib/config/fileUpload';
import { z } from 'zod';

// Create media schema using database schema with enhanced validation
export const createMediaSchema = insertMediaSchema
  .pick({
    propertyId: true,
    type: true,
    url: true,
    fileName: true,
    fileSize: true,
    displayOrder: true,
    isPrimary: true,
  })
  .extend({
    url: z.url('Invalid URL format'),
    fileName: z
      .string()
      .min(1, 'File name is required')
      .max(255, 'File name cannot exceed 255 characters')
      .optional(),
    fileSize: z
      .number()
      .int()
      .positive('File size must be positive')
      .max(maxFileSize, `File size cannot exceed ${maxFileSizeMB}MB`)
      .optional(),
    displayOrder: z.number().int().min(0).max(1000, 'Display order cannot exceed 1000').optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

// Update media schema
export const updateMediaSchema = insertMediaSchema
  .pick({
    type: true,
    url: true,
    fileName: true,
    fileSize: true,
    displayOrder: true,
    isPrimary: true,
  })
  .extend({
    url: z.url('Invalid URL format').optional(),
    fileName: z
      .string()
      .min(1, 'File name is required')
      .max(255, 'File name cannot exceed 255 characters')
      .optional(),
    fileSize: z
      .number()
      .int()
      .positive('File size must be positive')
      .max(maxFileSize, `File size cannot exceed ${maxFileSizeMB}MB`)
      .optional(),
    displayOrder: z.number().int().min(0).max(1000, 'Display order cannot exceed 1000').optional(),
    isPrimary: z.boolean().optional(),
  })
  .partial()
  .strict();

// Get media by ID schema
export const getMediaByIdSchema = selectMediaSchema
  .pick({
    id: true,
  })
  .strict();

// Query media schema
export const queryMediaSchema = z
  .object({
    propertyId: z.uuid('Invalid property ID format').optional(),
    type: z.enum(mediaType.enumValues).optional(),
    isPrimary: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
  })
  .strict();

// Delete media schema
export const deleteMediaSchema = selectMediaSchema
  .pick({
    id: true,
  })
  .strict();

// Bulk upload media schema
export const bulkUploadMediaSchema = z
  .object({
    propertyId: z.uuid('Invalid property ID format'),
    media: z
      .array(
        createMediaSchema.omit({ propertyId: true }).extend({
          url: z.url('Invalid URL format'),
          displayOrder: z.number().int().min(0).max(1000),
        }),
      )
      .min(1, 'At least one media item is required')
      .max(
        maxPropertyMediaFiles,
        `Cannot upload more than ${maxPropertyMediaFiles} media items at once`,
      ),
  })
  .refine(
    (data) => {
      // Only one primary media allowed
      const primaryCount = data.media.filter((item) => item.isPrimary).length;
      return primaryCount <= 1;
    },
    {
      message: 'Only one media item can be set as primary',
      path: ['media'],
    },
  )
  .strict();

// File upload schemas
export const propertyMediaUploadSchema = z.object({
  fileType: z.string().refine((type) => allowedFileTypes.includes(type), {
    message: 'Invalid file type. Allowed: JPEG, PNG, GIF, MP4, QuickTime',
  }),
  fileSize: z.number().max(maxFileSize, {
    message: `File size cannot exceed ${maxFileSizeMB}MB`,
  }),
  checksum: z.string().min(1, {
    message: 'Checksum is required',
  }),
  propertyId: z.uuid({
    message: 'Valid property ID is required',
  }),
});

export const deleteMediaUploadSchema = z.object({
  mediaIds: z.array(z.uuid()).min(1, 'At least one media ID required'),
  propertyId: z.uuid('Valid property ID is required'),
});

export type CreateMediaData = z.infer<typeof createMediaSchema>;
export type UpdateMediaData = z.infer<typeof updateMediaSchema>;
export type GetMediaByIdParams = z.infer<typeof getMediaByIdSchema>;
export type QueryMediaParams = z.infer<typeof queryMediaSchema>;
export type DeleteMediaParams = z.infer<typeof deleteMediaSchema>;
export type BulkUploadMediaData = z.infer<typeof bulkUploadMediaSchema>;
export type PropertyMediaUploadData = z.infer<typeof propertyMediaUploadSchema>;
export type DeleteMediaUploadData = z.infer<typeof deleteMediaUploadSchema>;
