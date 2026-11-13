import type { NextFunction, Request, Response } from 'express';
import { loginUser, registerUser } from '../services/authService.js';
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
