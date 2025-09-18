import { setupPropertyExpirationCron } from './propertyExpiration';
import { setupTokenCleanupCron } from './tokenCleanup';

export const setupCrons = () => {
  setupTokenCleanupCron();
  setupPropertyExpirationCron();
};
