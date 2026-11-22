import { readdirSync } from 'node:fs';
import path from 'node:path';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import createHttpError from 'http-errors';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import YAML from 'yamljs';

interface SwaggerDocument extends JsonObject {
  paths?: Record<string, Record<string, JsonObject>>;
  components?: {
    schemas?: Record<string, JsonObject>;
    responses?: Record<string, JsonObject>;
    [key: string]: unknown;
  };
}

const backendRoot = path.resolve(__dirname, '../..');
const openApiPath = path.join(backendRoot, 'docs', 'openapi.yaml');
const componentsPath = path.join(backendRoot, 'swagger', 'components');
const pathsPath = path.join(backendRoot, 'swagger', 'paths');
const httpMethods = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put']);

const loadYamlDirectory = (directoryPath: string): Record<string, JsonObject> =>
  readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.yaml')
    .sort((first, second) => first.name.localeCompare(second.name))
    .reduce<Record<string, JsonObject>>((documents, entry) => {
      const componentName = path.basename(entry.name, '.yaml');
      documents[componentName] = YAML.load(path.join(directoryPath, entry.name)) as JsonObject;
      return documents;
    }, {});

const normalizeReferences = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeReferences);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (key === '$ref' && typeof entry === 'string') {
        const match = entry.match(/components\/(schemas|responses)\/([^/]+)\.ya?ml$/);

        if (match) {
          return [key, `#/components/${match[1]}/${match[2]}`];
        }
      }

      return [key, normalizeReferences(entry)];
    }),
  );
};

const loadPathDocuments = (): Record<string, Record<string, JsonObject>> => {
  const loadedPaths: Record<string, Record<string, JsonObject>> = {};

  const visitDirectory = (directoryPath: string, pathSegments: string[]): void => {
    const entries = readdirSync(directoryPath, { withFileTypes: true }).sort((first, second) =>
      first.name.localeCompare(second.name),
    );

    for (const entry of entries) {
      if (entry.isDirectory()) {
        visitDirectory(path.join(directoryPath, entry.name), [...pathSegments, entry.name]);
        continue;
      }

      if (!entry.isFile() || path.extname(entry.name) !== '.yaml') {
        continue;
      }

      const method = path.basename(entry.name, '.yaml').toLowerCase();

      if (!httpMethods.has(method) || pathSegments.length === 0) {
        throw new Error(`Invalid Swagger path file: ${path.join(directoryPath, entry.name)}`);
      }

      const routePath = `/${pathSegments.join('/')}`;
      const routeMethods = loadedPaths[routePath] ?? {};

      if (routeMethods[method]) {
        throw new Error(`Duplicate Swagger operation: ${method.toUpperCase()} ${routePath}`);
      }

      routeMethods[method] = normalizeReferences(
        YAML.load(path.join(directoryPath, entry.name)),
      ) as JsonObject;
      loadedPaths[routePath] = routeMethods;
    }
  };

  visitDirectory(pathsPath, []);
  return loadedPaths;
};

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

  const loadedPaths = loadPathDocuments();
  document.paths = { ...document.paths };

  for (const [routePath, methods] of Object.entries(loadedPaths)) {
    document.paths[routePath] = {
      ...document.paths[routePath],
      ...methods,
    };
  }

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
