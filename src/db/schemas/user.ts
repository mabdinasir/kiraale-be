import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { role } from './enums';

export const user = pgTable('user', {
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
  isSignedIn: boolean('isSignedIn').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  profilePicture: text('profilePicture'),
  bio: text('bio'),
  address: text('address'),
  agentNumber: text('agentNumber'),
  agencyName: text('agencyName'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
});

export const insertUserSchema = createInsertSchema(user).omit({ id: true });
export const selectUserSchema = createSelectSchema(user);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type UserWithoutPassword = Omit<User, 'password'>;
