import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(30, 'Username must be at most 30 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
