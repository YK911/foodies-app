import { randomUUID } from 'node:crypto';
import createHttpError from 'http-errors';
import jwt, { JsonWebTokenError, type JwtPayload, type SignOptions } from 'jsonwebtoken';

interface SessionToken {
  sessionId: string;
  token: string;
  expiresAt: Date;
}

interface VerifiedSessionToken {
  userId: string;
  sessionId: string;
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
    algorithm: 'HS256',
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

export const verifySessionToken = (token: string): VerifiedSessionToken => {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      typeof payload.sessionId !== 'string'
    ) {
      throw createHttpError(401, 'Invalid or expired token');
    }

    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
    };
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw createHttpError(401, 'Invalid or expired token');
    }

    throw error;
  }
};
