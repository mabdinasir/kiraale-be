import { pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { permission, role } from './enums';

export const rolePermission = pgTable(
  'rolePermission',
  {
    roleValue: role('roleValue').notNull(),
    permissionValue: permission('permissionValue').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.roleValue, table.permissionValue] })],
);

export const insertRolePermissionSchema = createInsertSchema(rolePermission);
export const selectRolePermissionSchema = createSelectSchema(rolePermission);

export type RolePermission = typeof rolePermission.$inferSelect;
export type NewRolePermission = typeof rolePermission.$inferInsert;
