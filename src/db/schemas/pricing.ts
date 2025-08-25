import { relations } from 'drizzle-orm';
import { boolean, decimal, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { currency, serviceType } from './enums';

export const servicePricing = pgTable(
  'servicePricing',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serviceType: serviceType('serviceType').notNull(),
    serviceName: text('serviceName').notNull(), // Display name like "Property Listing Fee"
    amount: decimal('amount').notNull(),
    currency: currency('currency').default('USD').notNull(),
    description: text('description'), // Optional description
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('service_pricing_service_type_idx').on(table.serviceType),
    index('service_pricing_active_idx').on(table.active),
  ],
);

export const servicePricingRelations = relations(servicePricing, () => ({}));

export const insertServicePricingSchema = createInsertSchema(servicePricing).omit({ id: true });
export const selectServicePricingSchema = createSelectSchema(servicePricing);

export type ServicePricing = typeof servicePricing.$inferSelect;
export type NewServicePricing = typeof servicePricing.$inferInsert;
