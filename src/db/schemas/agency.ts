import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';
import { country } from './enums';
import { user } from './user';

export const agency = pgTable('agency', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  country: country('country').notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 200 }),
  licenseNumber: varchar('licenseNumber', { length: 100 }),
  isActive: boolean('isActive').default(true).notNull(),
  isSuspended: boolean('isSuspended').default(false).notNull(),
  suspendedAt: timestamp('suspendedAt', { withTimezone: true }),
  suspendedBy: uuid('suspendedBy').references(() => user.id, { onDelete: 'set null' }),
  suspensionReason: text('suspensionReason'),
  createdById: uuid('createdById')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const agencyAgent = pgTable(
  'agencyAgent',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agencyId: uuid('agencyId')
      .notNull()
      .references(() => agency.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull().default('AGENT'), // AGENCY_ADMIN, AGENT
    isActive: boolean('isActive').default(true).notNull(),
    joinedAt: timestamp('joinedAt', { withTimezone: true }).defaultNow().notNull(),
    leftAt: timestamp('leftAt', { withTimezone: true }),
  },
  (table) => [
    // Ensure a user can only be an active agent in one agency at a time
    unique('unique_active_user_agency').on(table.userId, table.isActive),
  ],
);

// Relations
export const agencyRelations = relations(agency, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [agency.createdById],
    references: [user.id],
  }),
  agents: many(agencyAgent),
}));

export const agencyAgentRelations = relations(agencyAgent, ({ one }) => ({
  agency: one(agency, {
    fields: [agencyAgent.agencyId],
    references: [agency.id],
  }),
  user: one(user, {
    fields: [agencyAgent.userId],
    references: [user.id],
  }),
}));

export const insertAgencySchema = createInsertSchema(agency, {
  name: (schema) => schema.min(2, { message: 'Agency name must be at least 2 characters' }),
  address: (schema) => schema.min(10, { message: 'Address must be at least 10 characters' }),
  email: z.email({ message: 'Invalid email format' }).optional(),
  website: z.url({ message: 'Invalid website URL' }).optional(),
});

export const selectAgencySchema = createSelectSchema(agency);

export const insertAgencyAgentSchema = createInsertSchema(agencyAgent);
export const selectAgencyAgentSchema = createSelectSchema(agencyAgent);

export type Agency = typeof agency.$inferSelect;
export type NewAgency = typeof agency.$inferInsert;
export type AgencyAgent = typeof agencyAgent.$inferSelect;
export type NewAgencyAgent = typeof agencyAgent.$inferInsert;
