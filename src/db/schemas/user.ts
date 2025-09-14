import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { role } from './enums';

export const user = pgTable(
  'user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    email: text('email').notNull().unique(),
    mobile: text('mobile').unique(),
    password: text('password').notNull(),
    role: role('role').default('USER').notNull(),
    nationalId: text('nationalId'),
    passportNumber: text('passportNumber'),
    hasAcceptedTnC: boolean('hasAcceptedTnC').default(false).notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    isSuspended: boolean('isSuspended').default(false).notNull(),
    suspensionReason: text('suspensionReason'),
    isSignedIn: boolean('isSignedIn').default(false).notNull(),
    isDeleted: boolean('isDeleted').default(false).notNull(),
    profilePicture: text('profilePicture'),
    bio: text('bio'),
    address: text('address'),
    agentNumber: text('agentNumber'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => [
    // Indexes for faster queries
    index('user_email_idx').on(table.email),
    index('user_mobile_idx').on(table.mobile),
    index('user_role_idx').on(table.role),
    index('user_isActive_idx').on(table.isActive),
    index('user_isSuspended_idx').on(table.isSuspended),
    index('user_isDeleted_idx').on(table.isDeleted),
    index('user_createdAt_idx').on(table.createdAt),
  ],
);

// User relation with agency is defined in agency.ts to avoid circular imports

export const insertUserSchema = createInsertSchema(user).omit({ id: true });
export const selectUserSchema = createSelectSchema(user);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type UserWithoutPassword = Omit<User, 'password'>;
