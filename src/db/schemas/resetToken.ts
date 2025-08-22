import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { user } from './user';

export const resetToken = pgTable('resetToken', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const insertResetTokenSchema = createInsertSchema(resetToken).omit({ id: true });
export const selectResetTokenSchema = createSelectSchema(resetToken);

export type ResetToken = typeof resetToken.$inferSelect;
export type NewResetToken = typeof resetToken.$inferInsert;
