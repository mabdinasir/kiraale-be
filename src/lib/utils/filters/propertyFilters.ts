import { property, user } from '@db';
import { and, eq, ne, or, type SQL } from 'drizzle-orm';

/**
 * Get property status filters for public/user access
 * Excludes: PENDING, REJECTED, EXPIRED
 * Includes: AVAILABLE, LEASED, SOLD
 */
export function getPublicPropertyStatusFilters(): SQL {
  const condition = and(
    ne(property.status, 'PENDING'),
    ne(property.status, 'REJECTED'),
    ne(property.status, 'EXPIRED'),
  );
  if (!condition) {
    throw new Error('Failed to create property status filter');
  }
  return condition;
}

/**
 * Get property status filters for property owners
 * Owners can see all their own properties including PENDING, REJECTED, EXPIRED
 */
export function getOwnerPropertyStatusFilters(userId: string): SQL {
  const condition = or(
    // Public properties (approved and active)
    and(
      ne(property.status, 'PENDING'),
      ne(property.status, 'REJECTED'),
      ne(property.status, 'EXPIRED'),
    ),
    // Own properties (can see all statuses)
    eq(property.userId, userId),
  );
  if (!condition) {
    throw new Error('Failed to create owner property status filter');
  }
  return condition;
}

/**
 * Get active user filters
 * Excludes: isSuspended: true, isActive: false, isDeleted: true
 */
export function getActiveUserFilters(): SQL[] {
  return [eq(user.isActive, true), eq(user.isSuspended, false), eq(user.isDeleted, false)];
}

/**
 * Combined filters for public property access with active users
 */
export function getPublicPropertyWithActiveUserFilters(): SQL[] {
  return [getPublicPropertyStatusFilters(), ...getActiveUserFilters()];
}

/**
 * Combined filters for property owner access with active users
 */
export function getOwnerPropertyWithActiveUserFilters(userId: string): SQL[] {
  return [getOwnerPropertyStatusFilters(userId), ...getActiveUserFilters()];
}
