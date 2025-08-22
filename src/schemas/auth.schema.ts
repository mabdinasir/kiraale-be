import { insertUserSchema, selectResetTokenSchema } from '@db/schemas';
import { z } from 'zod';

// Enhanced password schema with stronger validation
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/u,
    'Password must contain at least one uppercase, lowercase, number, and special character',
  );

// Enhanced mobile validation
const mobileSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .refine(
    (value) => value.length >= 10 && value.length <= 15,
    'Mobile number must be between 10 and 15 characters',
  );

// Login schema using database schema
export const loginSchema = insertUserSchema
  .pick({
    email: true,
    password: true,
  })
  .extend({
    password: passwordSchema,
  })
  .strict();

// Signup schema using database schema with required fields only
export const signUpSchema = insertUserSchema
  .pick({
    firstName: true,
    lastName: true,
    email: true,
    mobile: true,
    password: true,
    hasAcceptedTnC: true,
  })
  .extend({
    password: passwordSchema,
    mobile: mobileSchema,
    hasAcceptedTnC: z.boolean().refine((val) => val, 'You must accept the Terms and Conditions'),
  })
  .strict();

export const authorizationSchema = z
  .string()
  .regex(/^Bearer .+$/u, 'Invalid authorization header format');

export const requestPasswordResetSchema = insertUserSchema
  .pick({
    email: true,
  })
  .extend({
    email: z.email('Email is required'),
  })
  .strict();

export const resetPasswordSchema = selectResetTokenSchema
  .pick({
    token: true,
  })
  .extend({
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
