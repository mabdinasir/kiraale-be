import { agencyRole, country, insertAgencySchema, selectAgencySchema } from '@db';
import { z } from 'zod';

// Create agency request
export const createAgencySchema = insertAgencySchema
  .pick({
    name: true,
    description: true,
    country: true,
    address: true,
    phone: true,
    email: true,
    website: true,
    licenseNumber: true,
  })
  .extend({
    name: z.string().min(2, 'Agency name must be at least 2 characters'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    email: z.email('Invalid email format').optional().or(z.literal('')),
    website: z.url('Invalid website URL').optional().or(z.literal('')),
  })
  .strict();

// Update agency request
export const updateAgencySchema = insertAgencySchema
  .pick({
    name: true,
    description: true,
    address: true,
    phone: true,
    email: true,
    website: true,
    licenseNumber: true,
    isActive: true,
  })
  .extend({
    name: z.string().min(2, 'Agency name must be at least 2 characters').optional(),
    address: z.string().min(10, 'Address must be at least 10 characters').optional(),
    email: z.email('Invalid email format').optional().or(z.literal('')),
    website: z.url('Invalid website URL').optional().or(z.literal('')),
  })
  .partial()
  .strict();

// Get agency by ID params
export const getAgencyByIdSchema = selectAgencySchema
  .pick({
    id: true,
  })
  .strict();

// Add agent to agency request
export const addAgentToAgencySchema = z
  .object({
    userId: z.uuid('Invalid user ID format'),
    role: z.enum(agencyRole.enumValues).default('AGENT'),
  })
  .strict();

// Update agent role request
export const updateAgentRoleSchema = z
  .object({
    role: z.enum(agencyRole.enumValues),
  })
  .strict();

// Remove agent from agency params
export const removeAgentFromAgencySchema = z
  .object({
    agencyId: z.uuid('Invalid agency ID format'),
    userId: z.uuid('Invalid user ID format'),
  })
  .strict();

// Suspend agency request
export const suspendAgencySchema = z
  .object({
    suspensionReason: z
      .string()
      .min(10, 'Suspension reason must be at least 10 characters')
      .optional(), // Optional when unsuspending
  })
  .strict();

// Get agency agents query params
export const getAgencyAgentsSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(50),
    isActive: z.coerce.boolean().optional(),
  })
  .strict();

// Get agencies query params
export const getAgenciesSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(50),
    country: z.enum(country.enumValues).optional(),
    isActive: z.coerce.boolean().optional(),
    search: z.string().min(1).max(100).optional(),
  })
  .strict();

// Comprehensive agency search schema
export const searchAgenciesSchema = z
  .object({
    // Pagination
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(50),

    // Text search - searches across name, description, address
    search: z.string().trim().min(1).max(100).optional(),

    // Core filters
    country: z.enum(country.enumValues).optional(),
    isActive: z.coerce.boolean().optional(),

    // Contact and verification filters
    email: z.email().optional(),
    phone: z.string().min(1).max(20).optional(),
    website: z.url().optional(),
    licenseNumber: z.string().min(1).max(100).optional(),

    // Location search
    address: z.string().trim().min(1).optional(),

    // Date filters
    createdAfter: z.coerce.date().optional(),
    createdBefore: z.coerce.date().optional(),

    // Include agents in response
    includeAgents: z.coerce.boolean().default(false),

    // Sorting
    sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'country']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

// Admin search agencies schema
export const adminSearchAgenciesSchema = z
  .object({
    search: z.string().trim().min(1).max(200),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    includeAgents: z.coerce.boolean().default(false),
  })
  .strict();

export type CreateAgencyRequest = z.infer<typeof createAgencySchema>;
export type UpdateAgencyRequest = z.infer<typeof updateAgencySchema>;
export type GetAgencyByIdParams = z.infer<typeof getAgencyByIdSchema>;
export type AddAgentToAgencyRequest = z.infer<typeof addAgentToAgencySchema>;
export type UpdateAgentRoleRequest = z.infer<typeof updateAgentRoleSchema>;
export type RemoveAgentFromAgencyParams = z.infer<typeof removeAgentFromAgencySchema>;
export type GetAgencyAgentsQuery = z.infer<typeof getAgencyAgentsSchema>;
export type GetAgenciesQuery = z.infer<typeof getAgenciesSchema>;
export type SearchAgenciesQuery = z.infer<typeof searchAgenciesSchema>;
export type AdminSearchAgenciesQuery = z.infer<typeof adminSearchAgenciesSchema>;
