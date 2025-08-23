import { agencyRole, country, insertAgencySchema, selectAgencySchema } from '@db/schemas';
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

// Get agency agents query params
export const getAgencyAgentsSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    isActive: z.coerce.boolean().optional(),
  })
  .strict();

// Get agencies query params
export const getAgenciesSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    country: z.enum(country.enumValues).optional(),
    isActive: z.coerce.boolean().optional(),
    search: z.string().min(1).max(100).optional(),
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
