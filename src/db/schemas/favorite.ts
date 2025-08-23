import { relations } from 'drizzle-orm';
import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { property } from './property';
import { user } from './user';

export const favorite = pgTable(
  'favorite',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    propertyId: uuid('propertyId')
      .notNull()
      .references(() => property.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    // Ensure a user can only favorite a property once
    unique('unique_user_property_favorite').on(table.userId, table.propertyId),
  ],
);

// Relations
export const favoriteRelations = relations(favorite, ({ one }) => ({
  user: one(user, {
    fields: [favorite.userId],
    references: [user.id],
  }),
  property: one(property, {
    fields: [favorite.propertyId],
    references: [property.id],
  }),
}));

export const insertFavoriteSchema = createInsertSchema(favorite).omit({ id: true });
export const selectFavoriteSchema = createSelectSchema(favorite);

export type Favorite = typeof favorite.$inferSelect;
export type NewFavorite = typeof favorite.$inferInsert;
