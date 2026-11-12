import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'node:path';
import createHttpError, { HttpError } from 'http-errors';
import categoriesRouter from './routes/categoriesRouter.js';
import areasRouter from './routes/areasRouter.js';
import ingredientsRouter from './routes/ingredientsRouter.js';
import testimonialsRouter from './routes/testimonialsRouter.js';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  try {
    const swaggerDocument = YAML.load(path.join(process.cwd(), 'docs', 'openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err) {
    console.warn('Swagger documentation not loaded yet.');
  }

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // BE-05: public lookup endpoints
  app.use('/api/categories', categoriesRouter);
  app.use('/api/areas', areasRouter);
  app.use('/api/ingredients', ingredientsRouter);
  app.use('/api/testimonials', testimonialsRouter);

  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(createHttpError(404, 'Route not found'));
  });

  app.use((err: HttpError | Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = 'status' in err && typeof err.status === 'number' ? err.status : 500;
    res.status(status).json({
      status,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
};
