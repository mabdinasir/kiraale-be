import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { agency } from './agency';
import {
  country,
  listingType,
  priceType,
  propertyStatus,
  propertyType,
  rentFrequency,
} from './enums';
import { user } from './user';

export const property = pgTable(
  'property',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    agencyId: uuid('agencyId').references(() => agency.id, { onDelete: 'set null' }),

    // Basic info
    title: text('title').notNull(),
    description: text('description'),
    propertyType: propertyType('propertyType').notNull(),
    listingType: listingType('listingType').notNull(),

    // Core features
    bedrooms: integer('bedrooms').default(0),
    bathrooms: integer('bathrooms').default(0),
    parkingSpaces: integer('parkingSpaces').default(0),
    landSize: integer('landSize').default(0), // in sqm
    floorArea: integer('floorArea').default(0), // in sqm
    hasAirConditioning: boolean('hasAirConditioning').default(false),

    // Location
    address: text('address').notNull(),
    country: country('country').notNull(),

    // Pricing
    price: decimal('price').notNull(),
    priceType: priceType('priceType').notNull(),
    rentFrequency: rentFrequency('rentFrequency'),

    // Status
    status: propertyStatus('status').default('PENDING').notNull(),
    availableFrom: timestamp('availableFrom'),

    // Approval workflow
    reviewedAt: timestamp('reviewedAt'),
    reviewedBy: uuid('reviewedBy').references(() => user.id, { onDelete: 'set null' }),
    rejectionReason: text('rejectionReason'),
    adminNotes: text('adminNotes'),

    // Full-text search
    searchVector: text('searchVector').$type<string>(),

    // Metadata
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => [
    // Indexes for faster queries
    index('property_userId_idx').on(table.userId),
    index('property_propertyType_idx').on(table.propertyType),
    index('property_listingType_idx').on(table.listingType),
    index('property_status_idx').on(table.status),
    index('property_country_idx').on(table.country),
    index('property_price_idx').on(table.price),
    index('property_bedrooms_idx').on(table.bedrooms),
    index('property_bathrooms_idx').on(table.bathrooms),
    index('property_createdAt_idx').on(table.createdAt),
    // Full-text search index
    index('property_searchVector_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.searchVector})`,
    ),
  ],
);

// Relations
export const propertyRelations = relations(property, ({ one }) => ({
  user: one(user, {
    fields: [property.userId],
    references: [user.id],
  }),
  agency: one(agency, {
    fields: [property.agencyId],
    references: [agency.id],
  }),
}));

export const insertPropertySchema = createInsertSchema(property).omit({ id: true });
export const selectPropertySchema = createSelectSchema(property);

export type Property = typeof property.$inferSelect;
export type NewProperty = typeof property.$inferInsert;
