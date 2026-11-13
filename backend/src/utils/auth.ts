import { randomUUID } from 'node:crypto';
import createHttpError from 'http-errors';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

interface SessionToken {
  sessionId: string;
  token: string;
  expiresAt: Date;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw createHttpError(500, 'JWT secret is not configured');
  }

  return secret;
};

export const createSessionToken = (userId: string): SessionToken => {
  const sessionId = randomUUID();
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  const token = jwt.sign({ sessionId }, getJwtSecret(), {
    subject: userId,
    expiresIn,
  });
  const payload = jwt.decode(token) as JwtPayload | null;

  if (typeof payload?.exp !== 'number') {
    throw createHttpError(500, 'JWT expiration is not configured correctly');
  }

  return {
    sessionId,
    token,
    expiresAt: new Date(payload.exp * 1000),
  };
};
