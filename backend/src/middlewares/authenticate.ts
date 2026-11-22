import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { prisma } from '../db/prisma.js';

interface JwtPayload {
  id: string;
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) throw createHttpError(401, 'Not authorized');

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');

    const payload = jwt.verify(token, secret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) throw createHttpError(401, 'Not authorized');
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createHttpError(401, 'Invalid or expired token'));
      return;
    }
    next(error);
  }
};
