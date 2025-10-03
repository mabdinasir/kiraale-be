import { z } from 'zod';

export const createContactSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 characters'),
  email: z.email(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const adminSearchContactsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  isResolved: z.coerce.boolean().optional(),
});

export const resolveContactSchema = z.object({
  adminNotes: z.string().min(1, 'Admin notes are required'),
});

export const getContactParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type AdminSearchContactsInput = z.infer<typeof adminSearchContactsSchema>;
export type ResolveContactInput = z.infer<typeof resolveContactSchema>;
export type GetContactParams = z.infer<typeof getContactParamsSchema>;
