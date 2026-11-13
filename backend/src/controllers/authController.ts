import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { loginUser, logoutUser, registerUser } from '../services/authService.js';
import type { LoginInput, RegisterInput } from '../validation/authSchemas.js';

export const register = async (
  req: Request<Record<string, never>, unknown, RegisterInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(201).json(await registerUser(req.body));
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<Record<string, never>, unknown, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(200).json(await loginUser(req.body));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.sessionId) {
      throw createHttpError(401, 'Authentication is required');
    }

    await logoutUser(req.sessionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
