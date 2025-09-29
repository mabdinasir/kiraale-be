import { relations } from 'drizzle-orm';
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
import {
  documentType,
  familyRelationship,
  inspectionType,
  leaseFrequency,
  leaseType,
  maintenanceUrgency,
} from './enums';
import { property } from './property';
import { user } from './user';

export const tenant = pgTable(
  'tenant',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('propertyId')
      .notNull()
      .references(() => property.id, { onDelete: 'cascade' }),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    email: text('email').notNull(),
    mobile: text('mobile').notNull(),
    nationalId: text('nationalId'),
    passportNumber: text('passportNumber'),
    emergencyContactName: text('emergencyContactName').notNull(),
    emergencyContactPhone: text('emergencyContactPhone').notNull(),
    leaseType: leaseType('leaseType').notNull(),
    leaseFrequency: leaseFrequency('leaseFrequency').notNull(),
    rentAmount: decimal('rentAmount', { precision: 12, scale: 2 }).notNull(),
    leaseStartDate: timestamp('leaseStartDate', { withTimezone: true }).notNull(),
    leaseEndDate: timestamp('leaseEndDate', { withTimezone: true }),
    isActive: boolean('isActive').default(true).notNull(),
    leaseEndReason: text('leaseEndReason'),
    leaseEndNotes: text('leaseEndNotes'),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tenant_propertyId_idx').on(table.propertyId),
    index('tenant_email_idx').on(table.email),
    index('tenant_isActive_idx').on(table.isActive),
    index('tenant_leaseStartDate_idx').on(table.leaseStartDate),
    index('tenant_createdAt_idx').on(table.createdAt),
  ],
);

export const tenantFamilyMember = pgTable(
  'tenantFamilyMember',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenantId')
      .notNull()
      .references(() => tenant.id, { onDelete: 'cascade' }),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    email: text('email'),
    mobile: text('mobile'),
    relationship: familyRelationship('relationship').notNull(),
    age: integer('age').notNull(),
    nationalId: text('nationalId'),
    isMinor: boolean('isMinor').default(false).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tenantFamilyMember_tenantId_idx').on(table.tenantId),
    index('tenantFamilyMember_relationship_idx').on(table.relationship),
  ],
);

export const tenantDocument = pgTable(
  'tenantDocument',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenantId')
      .notNull()
      .references(() => tenant.id, { onDelete: 'cascade' }),
    documentType: documentType('documentType').notNull(),
    url: text('url').notNull(),
    fileName: text('fileName').notNull(),
    fileSize: integer('fileSize').notNull(),
    mimeType: text('mimeType').notNull(),
    uploadedBy: uuid('uploadedBy')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    uploadedAt: timestamp('uploadedAt', { withTimezone: true }).defaultNow().notNull(),
    expiryDate: timestamp('expiryDate', { withTimezone: true }),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tenantDocument_tenantId_idx').on(table.tenantId),
    index('tenantDocument_documentType_idx').on(table.documentType),
    index('tenantDocument_uploadedBy_idx').on(table.uploadedBy),
  ],
);

export const securityDeposit = pgTable(
  'securityDeposit',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenantId')
      .notNull()
      .references(() => tenant.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    paidDate: timestamp('paidDate', { withTimezone: true }).notNull(),
    receiptNumber: text('receiptNumber').notNull(),
    refundAmount: decimal('refundAmount', { precision: 12, scale: 2 }),
    refundDate: timestamp('refundDate', { withTimezone: true }),
    refundReason: text('refundReason'),
    refundedBy: uuid('refundedBy').references(() => user.id, { onDelete: 'set null' }),
    isRefunded: boolean('isRefunded').default(false).notNull(),
    isDeleted: boolean('isDeleted').default(false).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('securityDeposit_tenantId_idx').on(table.tenantId),
    index('securityDeposit_isRefunded_idx').on(table.isRefunded),
    index('securityDeposit_isDeleted_idx').on(table.isDeleted),
  ],
);

export const rentPayment = pgTable(
  'rentPayment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenantId')
      .notNull()
      .references(() => tenant.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    paidDate: timestamp('paidDate', { withTimezone: true }).notNull(),
    receiptNumber: text('receiptNumber').notNull(),
    paymentMethod: text('paymentMethod').notNull(),
    receivedBy: uuid('receivedBy')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    paymentPeriodStart: timestamp('paymentPeriodStart', { withTimezone: true }).notNull(),
    paymentPeriodEnd: timestamp('paymentPeriodEnd', { withTimezone: true }).notNull(),
    isPaid: boolean('isPaid').default(true).notNull(),
    isDeleted: boolean('isDeleted').default(false).notNull(),
    notes: text('notes'),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('rentPayment_tenantId_idx').on(table.tenantId),
    index('rentPayment_paidDate_idx').on(table.paidDate),
    index('rentPayment_receivedBy_idx').on(table.receivedBy),
    index('rentPayment_isPaid_idx').on(table.isPaid),
    index('rentPayment_isDeleted_idx').on(table.isDeleted),
  ],
);

export const propertyInspection = pgTable(
  'propertyInspection',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('propertyId')
      .notNull()
      .references(() => property.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenantId').references(() => tenant.id, { onDelete: 'set null' }),
    inspectionDate: timestamp('inspectionDate', { withTimezone: true }).notNull(),
    inspectionType: inspectionType('inspectionType').notNull(),
    notes: text('notes').notNull(),
    overallRating: integer('overallRating').notNull(),
    inspectedBy: text('inspectedBy').notNull(),
    isDeleted: boolean('isDeleted').default(false).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('propertyInspection_propertyId_idx').on(table.propertyId),
    index('propertyInspection_tenantId_idx').on(table.tenantId),
    index('propertyInspection_inspectionDate_idx').on(table.inspectionDate),
    index('propertyInspection_inspectionType_idx').on(table.inspectionType),
    index('propertyInspection_isDeleted_idx').on(table.isDeleted),
  ],
);

export const maintenanceRecord = pgTable(
  'maintenanceRecord',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('propertyId')
      .notNull()
      .references(() => property.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenantId').references(() => tenant.id, { onDelete: 'set null' }),
    issue: text('issue').notNull(),
    description: text('description').notNull(),
    urgency: maintenanceUrgency('urgency').notNull(),
    reportedDate: timestamp('reportedDate', { withTimezone: true }).notNull(),
    assignedTo: text('assignedTo'),
    startedDate: timestamp('startedDate', { withTimezone: true }),
    completedDate: timestamp('completedDate', { withTimezone: true }),
    cost: decimal('cost', { precision: 12, scale: 2 }),
    isFixed: boolean('isFixed').default(false).notNull(),
    warrantyExpiry: timestamp('warrantyExpiry', { withTimezone: true }),
    contractorName: text('contractorName'),
    contractorPhone: text('contractorPhone'),
    notes: text('notes'),
    isDeleted: boolean('isDeleted').default(false).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('maintenanceRecord_propertyId_idx').on(table.propertyId),
    index('maintenanceRecord_tenantId_idx').on(table.tenantId),
    index('maintenanceRecord_urgency_idx').on(table.urgency),
    index('maintenanceRecord_isFixed_idx').on(table.isFixed),
    index('maintenanceRecord_reportedDate_idx').on(table.reportedDate),
    index('maintenanceRecord_isDeleted_idx').on(table.isDeleted),
  ],
);

// Relations
export const tenantRelations = relations(tenant, ({ one, many }) => ({
  property: one(property, {
    fields: [tenant.propertyId],
    references: [property.id],
  }),
  familyMembers: many(tenantFamilyMember),
  documents: many(tenantDocument),
  deposits: many(securityDeposit),
  rentPayments: many(rentPayment),
  inspections: many(propertyInspection),
  maintenanceRecords: many(maintenanceRecord),
}));

export const tenantFamilyMemberRelations = relations(tenantFamilyMember, ({ one }) => ({
  tenant: one(tenant, {
    fields: [tenantFamilyMember.tenantId],
    references: [tenant.id],
  }),
}));

export const tenantDocumentRelations = relations(tenantDocument, ({ one }) => ({
  tenant: one(tenant, {
    fields: [tenantDocument.tenantId],
    references: [tenant.id],
  }),
  uploadedBy: one(user, {
    fields: [tenantDocument.uploadedBy],
    references: [user.id],
  }),
}));

export const securityDepositRelations = relations(securityDeposit, ({ one }) => ({
  tenant: one(tenant, {
    fields: [securityDeposit.tenantId],
    references: [tenant.id],
  }),
  refundedBy: one(user, {
    fields: [securityDeposit.refundedBy],
    references: [user.id],
  }),
}));

export const rentPaymentRelations = relations(rentPayment, ({ one }) => ({
  tenant: one(tenant, {
    fields: [rentPayment.tenantId],
    references: [tenant.id],
  }),
  receivedBy: one(user, {
    fields: [rentPayment.receivedBy],
    references: [user.id],
  }),
}));

export const propertyInspectionRelations = relations(propertyInspection, ({ one }) => ({
  property: one(property, {
    fields: [propertyInspection.propertyId],
    references: [property.id],
  }),
  tenant: one(tenant, {
    fields: [propertyInspection.tenantId],
    references: [tenant.id],
  }),
}));

export const maintenanceRecordRelations = relations(maintenanceRecord, ({ one }) => ({
  property: one(property, {
    fields: [maintenanceRecord.propertyId],
    references: [property.id],
  }),
  tenant: one(tenant, {
    fields: [maintenanceRecord.tenantId],
    references: [tenant.id],
  }),
}));

// Schema exports
export const insertTenantSchema = createInsertSchema(tenant).omit({ id: true });
export const selectTenantSchema = createSelectSchema(tenant);

export const insertTenantFamilyMemberSchema = createInsertSchema(tenantFamilyMember).omit({
  id: true,
});
export const selectTenantFamilyMemberSchema = createSelectSchema(tenantFamilyMember);

export const insertTenantDocumentSchema = createInsertSchema(tenantDocument).omit({ id: true });
export const selectTenantDocumentSchema = createSelectSchema(tenantDocument);

export const insertSecurityDepositSchema = createInsertSchema(securityDeposit).omit({ id: true });
export const selectSecurityDepositSchema = createSelectSchema(securityDeposit);

export const insertRentPaymentSchema = createInsertSchema(rentPayment).omit({ id: true });
export const selectRentPaymentSchema = createSelectSchema(rentPayment);

export const insertPropertyInspectionSchema = createInsertSchema(propertyInspection).omit({
  id: true,
});
export const selectPropertyInspectionSchema = createSelectSchema(propertyInspection);

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecord).omit({
  id: true,
});
export const selectMaintenanceRecordSchema = createSelectSchema(maintenanceRecord);

// Type exports
export type Tenant = typeof tenant.$inferSelect;
export type NewTenant = typeof tenant.$inferInsert;

export type TenantFamilyMember = typeof tenantFamilyMember.$inferSelect;
export type NewTenantFamilyMember = typeof tenantFamilyMember.$inferInsert;

export type TenantDocument = typeof tenantDocument.$inferSelect;
export type NewTenantDocument = typeof tenantDocument.$inferInsert;

export type SecurityDeposit = typeof securityDeposit.$inferSelect;
export type NewSecurityDeposit = typeof securityDeposit.$inferInsert;

export type RentPayment = typeof rentPayment.$inferSelect;
export type NewRentPayment = typeof rentPayment.$inferInsert;

export type PropertyInspection = typeof propertyInspection.$inferSelect;
export type NewPropertyInspection = typeof propertyInspection.$inferInsert;

export type MaintenanceRecord = typeof maintenanceRecord.$inferSelect;
export type NewMaintenanceRecord = typeof maintenanceRecord.$inferInsert;
