import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { mediaType } from './enums';
import { property } from './property';

export const media = pgTable(
  'media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('propertyId')
      .notNull()
      .references(() => property.id, { onDelete: 'cascade' }),

    type: mediaType('type').notNull(),
    url: text('url').notNull(),
    fileName: text('fileName'),
    fileSize: integer('fileSize'), // in bytes
    displayOrder: integer('displayOrder').default(0).notNull(),
    isPrimary: boolean('isPrimary').default(false).notNull(),

    uploadedAt: timestamp('uploadedAt').defaultNow().notNull(),
  },
  (table) => [
    // Indexes for faster queries
    index('media_propertyId_idx').on(table.propertyId),
    index('media_type_idx').on(table.type),
    index('media_isPrimary_idx').on(table.isPrimary),
    index('media_displayOrder_idx').on(table.displayOrder),
  ],
);

export const insertMediaSchema = createInsertSchema(media).omit({ id: true });
export const selectMediaSchema = createSelectSchema(media);

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
