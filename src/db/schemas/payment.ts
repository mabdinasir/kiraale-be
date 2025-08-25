import { relations } from 'drizzle-orm';
import { decimal, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { paymentMethod, paymentStatus } from './enums';
import { property } from './property';
import { user } from './user';

export const payment = pgTable(
  'payment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    transactionId: text('transactionId').unique().notNull(),
    amount: decimal('amount').notNull(),
    receiptNumber: text('receiptNumber').notNull(),
    transactionDate: timestamp('transactionDate').notNull(),
    phoneNumber: text('phoneNumber').notNull(),
    paymentStatus: paymentStatus('paymentStatus').default('PENDING').notNull(),
    paymentMethod: paymentMethod('paymentMethod').notNull(),
    propertyId: uuid('propertyId').references(() => property.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('payment_userId_idx').on(table.userId),
    index('payment_propertyId_idx').on(table.propertyId),
    index('payment_paymentStatus_idx').on(table.paymentStatus),
    index('payment_transactionDate_idx').on(table.transactionDate),
  ],
);

// Relations
export const paymentRelations = relations(payment, ({ one }) => ({
  property: one(property, {
    fields: [payment.propertyId],
    references: [property.id],
  }),
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
  }),
}));

export const insertPaymentSchema = createInsertSchema(payment).omit({ id: true });
export const selectPaymentSchema = createSelectSchema(payment);

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;
