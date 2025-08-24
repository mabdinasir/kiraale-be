import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { property } from './property';
import { user } from './user';

export const propertyView = pgTable(
  'propertyView',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('propertyId')
      .notNull()
      .references(() => property.id, { onDelete: 'cascade' }),
    userId: uuid('userId').references(() => user.id, { onDelete: 'set null' }),
    sessionId: text('sessionId'),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    referrer: text('referrer'),
    viewedAt: timestamp('viewedAt').defaultNow().notNull(),
  },
  (table) => [
    // Indexes for efficient querying
    index('propertyView_propertyId_idx').on(table.propertyId),
    index('propertyView_userId_idx').on(table.userId),
    index('propertyView_sessionId_idx').on(table.sessionId),
    index('propertyView_viewedAt_idx').on(table.viewedAt),
    // Composite index for duplicate view prevention
    index('propertyView_property_user_date_idx').on(table.propertyId, table.userId, table.viewedAt),
    index('propertyView_property_session_date_idx').on(
      table.propertyId,
      table.sessionId,
      table.viewedAt,
    ),
  ],
);

export const insertPropertyViewSchema = createInsertSchema(propertyView).omit({
  id: true,
});
export const selectPropertyViewSchema = createSelectSchema(propertyView);

export type PropertyView = typeof propertyView.$inferSelect;
export type NewPropertyView = typeof propertyView.$inferInsert;
