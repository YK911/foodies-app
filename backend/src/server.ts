import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import createHttpError, { HttpError } from 'http-errors';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import categoriesRouter from './routes/categoriesRouter.js';
import areasRouter from './routes/areasRouter.js';
import ingredientsRouter from './routes/ingredientsRouter.js';
import testimonialsRouter from './routes/testimonialsRouter.js';
import authRouter from './routes/authRouter.js';
import usersRouter from './routes/usersRouter.js';
import multer from 'multer';

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
