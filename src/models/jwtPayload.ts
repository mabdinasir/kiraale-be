import type { User } from '@db';

export interface JwtPayload extends Omit<User, 'password'> {
  iat?: number;
  exp?: number;
}
