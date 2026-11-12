import { readdirSync } from 'node:fs';
import path from 'node:path';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import createHttpError from 'http-errors';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import YAML from 'yamljs';

interface SwaggerDocument extends JsonObject {
  components?: {
    schemas?: Record<string, JsonObject>;
    responses?: Record<string, JsonObject>;
    [key: string]: unknown;
  };
}

const backendRoot = path.resolve(__dirname, '../..');
const openApiPath = path.join(backendRoot, 'docs', 'openapi.yaml');
const componentsPath = path.join(backendRoot, 'swagger', 'components');

const loadYamlDirectory = (directoryPath: string): Record<string, JsonObject> =>
  readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.yaml')
    .sort((first, second) => first.name.localeCompare(second.name))
    .reduce<Record<string, JsonObject>>((documents, entry) => {
      const componentName = path.basename(entry.name, '.yaml');
      documents[componentName] = YAML.load(path.join(directoryPath, entry.name)) as JsonObject;
      return documents;
    }, {});

const loadSwaggerDocument = (): SwaggerDocument => {
  const document = YAML.load(openApiPath) as SwaggerDocument;
  const existingComponents = document.components ?? {};

  document.components = {
    ...existingComponents,
    schemas: {
      ...existingComponents.schemas,
      ...loadYamlDirectory(path.join(componentsPath, 'schemas')),
    },
    responses: {
      ...existingComponents.responses,
      ...loadYamlDirectory(path.join(componentsPath, 'responses')),
    },
  };

  return document;
};

const swaggerLoadError = (_req: Request, _res: Response, next: NextFunction): void => {
  next(createHttpError(500, "Can't load Swagger docs"));
};

export const swaggerDocs = (): RequestHandler[] => {
  try {
    const swaggerDocument = loadSwaggerDocument();
    return [...swaggerUi.serve, swaggerUi.setup(swaggerDocument)];
  } catch (error) {
    console.error('Failed to load Swagger documentation:', error);
    return [swaggerLoadError];
  }
};
