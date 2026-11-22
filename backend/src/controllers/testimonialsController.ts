import type { NextFunction, Request, Response } from 'express';
import { listTestimonials } from '../services/testimonialsService.js';

export const getTestimonials = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await listTestimonials());
  } catch (error) {
    next(error);
  }
};
