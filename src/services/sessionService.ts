import crypto from 'crypto';
import Session from '../models/Session';
import env from '../config/env';

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const refreshTtlMs = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;

export const createSession = async (
  userId: string
): Promise<{ token: string; expiresAt: Date }> => {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + refreshTtlMs);

  await Session.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return { token, expiresAt };
};

export const findSessionByToken = async (token: string) => {
  const tokenHash = hashToken(token);
  return Session.findOne({ where: { tokenHash } });
};

export const revokeSession = async (token: string) => {
  const tokenHash = hashToken(token);
  await Session.destroy({ where: { tokenHash } });
};

export const rotateSession = async (
  token: string,
  userId: string
): Promise<{ token: string; expiresAt: Date }> => {
  await revokeSession(token);
  return createSession(userId);
};
