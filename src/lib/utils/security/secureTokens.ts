import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @param length Token length in bytes (default: 32)
 * @returns Hex-encoded token string
 */
export const generateSecureToken = (length = 32): string =>
  crypto.randomBytes(length).toString('hex');

/**
 * Generate a secure token with timestamp for expiry validation
 * @param expiryMinutes Expiry time in minutes (default: 15)
 * @returns Object with token and expiry date
 */
export const generateExpiringToken = (expiryMinutes = 15) => {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    token,
    expiresAt,
  };
};

/**
 * Verify if a token has expired
 * @param expiresAt Expiry date
 * @returns True if expired, false otherwise
 */
export const isTokenExpired = (expiresAt: Date): boolean => new Date() > expiresAt;

/**
 * Hash a token for secure storage
 * @param token Plain text token
 * @returns SHA256 hash of the token
 */
export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');
