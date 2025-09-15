import db, { tokenBlacklist } from '@db';
import { lt } from 'drizzle-orm';

export const cleanupExpiredTokens = async () => {
  // Calculate date 60 days ago
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Delete tokens created more than 60 days ago
  await db.delete(tokenBlacklist).where(lt(tokenBlacklist.createdAt, sixtyDaysAgo));
};
