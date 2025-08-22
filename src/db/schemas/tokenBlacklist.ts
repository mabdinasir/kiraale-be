import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const tokenBlacklist = pgTable('tokenBlacklist', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const insertTokenBlacklistSchema = createInsertSchema(tokenBlacklist).omit({ id: true });
export const selectTokenBlacklistSchema = createSelectSchema(tokenBlacklist);

export type TokenBlacklist = typeof tokenBlacklist.$inferSelect;
export type NewTokenBlacklist = typeof tokenBlacklist.$inferInsert;
