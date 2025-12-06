import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import User from '../models/User';
import env from '../config/env';
import { signAccessToken } from '../services/tokenService';
import {
  createSession,
  findSessionByToken,
  revokeSession,
  rotateSession,
} from '../services/sessionService';
import { requireAuth } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken(user);
  const refresh = await createSession(user.id);

  return res.json({
    accessToken,
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  const session = await findSessionByToken(refreshToken);

  if (!session || session.expiresAt.getTime() < Date.now()) {
    await revokeSession(refreshToken);
    return res.status(401).json({ message: 'Refresh token expired' });
  }

  const user = await User.findByPk(session.userId);
  if (!user) {
    await revokeSession(refreshToken);
    return res.status(401).json({ message: 'Invalid session' });
  }

  const accessToken = signAccessToken(user);
  const nextRefresh = await rotateSession(refreshToken, user.id);

  return res.json({
    accessToken,
    refreshToken: nextRefresh.token,
    refreshTokenExpiresAt: nextRefresh.expiresAt,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  await revokeSession(refreshToken);
  return res.status(204).send();
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  role: z.enum(['admin', 'editor']).optional(),
});

router.post('/register', async (req, res) => {
  if (!env.allowRegistration) {
    return res.status(403).json({ message: 'Registration disabled' });
  }

  const payload = registerSchema.parse(req.body);
  const existing = await User.findOne({ where: { email: payload.email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    email: payload.email,
    passwordHash,
    role: payload.role ?? 'editor',
  });

  return res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
