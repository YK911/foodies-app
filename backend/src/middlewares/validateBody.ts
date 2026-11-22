import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { ObjectSchema } from 'joi';

export const validateBody =
  (schema: ObjectSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(createHttpError(400, message));
      return;
    }

    req.body = value;
    next();
  };
