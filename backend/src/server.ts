import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import multer from 'multer';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import areasRouter from './routes/areasRouter.js';
import authRouter from './routes/authRouter.js';
import categoriesRouter from './routes/categoriesRouter.js';
import ingredientsRouter from './routes/ingredientsRouter.js';
import recipesRouter from './routes/recipesRouter.js';
import testimonialsRouter from './routes/testimonialsRouter.js';
import usersRouter from './routes/usersRouter.js';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api-docs', swaggerDocs());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);

  // Public lookup endpoints
  app.use('/api/categories', categoriesRouter);
  app.use('/api/areas', areasRouter);
  app.use('/api/recipes', recipesRouter);
  app.use('/api/ingredients', ingredientsRouter);
  app.use('/api/testimonials', testimonialsRouter);
  app.use('/api/users', usersRouter);

  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(createHttpError(404, 'Route not found'));
  });

  app.use((err: HttpError | Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;

      res.status(status).json({
        status,
        message: err.code === 'LIMIT_FILE_SIZE' ? 'File size exceeds the 5 MB limit' : err.message,
      });

      return;
    }

    const status = 'status' in err && typeof err.status === 'number' ? err.status : 500;

    res.status(status).json({
      status,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
};
