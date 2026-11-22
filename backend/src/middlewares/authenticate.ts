import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../db/prisma.js';
import { verifySessionToken } from '../utils/auth.js';

const getBearerToken = (authorization: string | undefined): string => {
  const [scheme, token, ...extraParts] = authorization?.trim().split(/\s+/) ?? [];

  if (scheme?.toLowerCase() !== 'bearer' || !token || extraParts.length > 0) {
    throw createHttpError(401, 'Bearer token is required');
  }

  return token;
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { userId, sessionId } = verifySessionToken(token);
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!session || session.userId !== userId || session.expiresAt <= new Date()) {
      throw createHttpError(401, 'Invalid or expired token');
    }

    req.user = session.user;
    req.sessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
};
