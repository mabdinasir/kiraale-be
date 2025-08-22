import type { User } from '@db/schemas';

export interface JwtPayload extends Omit<User, 'password'> {
  iat?: number;
  exp?: number;
}
