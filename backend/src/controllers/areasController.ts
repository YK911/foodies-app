import type { NextFunction, Request, Response } from 'express';
import { listAreas } from '../services/areasService.js';

export const getAreas = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await listAreas());
  } catch (error) {
    next(error);
  }
};
