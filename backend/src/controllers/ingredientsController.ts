import type { NextFunction, Request, Response } from 'express';
import { listIngredients } from '../services/ingredientsService.js';

export const getIngredients = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await listIngredients());
  } catch (error) {
    next(error);
  }
};
