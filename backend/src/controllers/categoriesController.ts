import type { NextFunction, Request, Response } from 'express';
import { listCategories } from '../services/categoriesService.js';

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await listCategories());
  } catch (error) {
    next(error);
  }
};
