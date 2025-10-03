import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { user } from './user';

export const contact = pgTable(
  'contact',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fullName: text('fullName').notNull(),
    mobile: text('mobile').notNull(),
    email: text('email').notNull(),
    subject: text('subject'),
    message: text('message').notNull(),
    isResolved: boolean('isResolved').default(false).notNull(),
    resolvedById: uuid('resolvedById').references(() => user.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolvedAt'),
    adminNotes: text('adminNotes'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    index('contact_email_idx').on(table.email),
    index('contact_createdAt_idx').on(table.createdAt),
    index('contact_isResolved_idx').on(table.isResolved),
    index('contact_resolvedById_idx').on(table.resolvedById),
  ],
);

export const contactRelations = relations(contact, ({ one }) => ({
  resolvedBy: one(user, {
    fields: [contact.resolvedById],
    references: [user.id],
  }),
}));

export const insertContactSchema = createInsertSchema(contact).omit({ id: true });
export const selectContactSchema = createSelectSchema(contact);

export type Contact = typeof contact.$inferSelect;
export type NewContact = typeof contact.$inferInsert;
