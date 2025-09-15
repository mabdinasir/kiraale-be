import type { User } from '@db';
import { omitPassword } from '@lib';
import type { JwtPayload } from '@models';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const generateJwtToken = (user: User): string => {
  const userWithoutPassword = omitPassword(user);
  const payload: JwtPayload = { ...userWithoutPassword };

  return jwt.sign(payload, secret, { expiresIn: '30d', algorithm: 'HS512' });
};

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId, type: 'refresh' }, secret, {
    expiresIn: '60d',
    algorithm: 'HS512',
  });

export const verifyJwtToken = (token: string): JwtPayload =>
  jwt.verify(token, secret, { algorithms: ['HS512'] }) as JwtPayload;

export const verifyRefreshToken = (token: string): { userId: string; type: string } =>
  jwt.verify(token, secret, { algorithms: ['HS512'] }) as { userId: string; type: string };
