import jwt from 'jsonwebtoken';
import env from '../config/env';
import { UserAttributes } from '../models/User';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export const signAccessToken = (user: Pick<UserAttributes, 'id' | 'email' | 'role'>): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenTtl }
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
};
