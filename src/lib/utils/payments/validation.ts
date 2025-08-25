import db from '@db/index';
import { property, user } from '@db/schemas';
import { eq } from 'drizzle-orm';
import { logError } from '../error/errorHandler';

export const verifyPropertyExists = async (propertyId: string) => {
  const [propertyExists] = await db
    .select()
    .from(property)
    .where(eq(property.id, propertyId))
    .limit(1);

  if (!propertyExists) {
    logError('Property not found');
  }

  return propertyExists;
};

export const verifyUserExists = async (userId: string) => {
  const [userExists] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (!userExists) {
    logError('User not found');
  }

  return userExists;
};

export const verifyPropertyAndUser = async (propertyId: string, userId: string) => {
  const [propertyResult, userResult] = await Promise.all([
    verifyPropertyExists(propertyId),
    verifyUserExists(userId),
  ]);

  return { property: propertyResult, user: userResult };
};
