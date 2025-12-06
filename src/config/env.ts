import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

const numberFromEnv = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTokenTtlDays: numberFromEnv('REFRESH_TOKEN_TTL_DAYS', 30),
  contentDir: path.resolve(process.cwd(), process.env.CONTENT_DIR ?? 'content/posts'),
  allowRegistration: process.env.ALLOW_REGISTRATION === 'true',
};

export default env;
