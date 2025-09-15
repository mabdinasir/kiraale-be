import { cleanupExpiredTokens, logError } from '@lib';
import cron from 'node-cron';

// Run daily at 2 AM
export const setupTokenCleanupCron = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupExpiredTokens();
    } catch (error) {
      logError(`Failed to clean up expired tokens: ${(error as Error).message}`);
    }
  });
};
