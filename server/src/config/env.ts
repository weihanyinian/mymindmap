import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/mindflow'),
  JWT_ACCESS_SECRET: z.string().default('access-secret-dev'),
  JWT_REFRESH_SECRET: z.string().default('refresh-secret-dev'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
