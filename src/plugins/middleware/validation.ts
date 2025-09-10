import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@shared/errors';
import { v4 as uuidv4 } from 'uuid';
import type { PluginConfig } from '@models/plugins';
import { $ZodIssue } from 'zod/v4/core';

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

export function createValidationHandler(
  schemas: ValidationOptions
): preHandlerHookHandler {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    try {
      if (schemas.body && request.body) {
        request.body = schemas.body.parse(request.body);
      }

      if (schemas.query) {
        request.query = schemas.query.parse(request.query);
      }

      if (schemas.params) {
        request.params = schemas.params.parse(request.params);
      }

      if (schemas.headers) {
        const validatedHeaders = schemas.headers.parse(request.headers);
        Object.assign(request.headers, validatedHeaders);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationMessage = error.issues
          .map(
            (issue: $ZodIssue) => `${issue.path.join('.')}: ${issue.message}`
          )
          .join(', ');

        throw new ValidationError(
          `Validation failed: ${validationMessage}`,
          requestId
        );
      }
      throw error;
    }
  };
}

const validationPlugin = async (fastify: FastifyInstance) => {
  fastify.decorate('validate', createValidationHandler);
};

export const validationPluginConfig: PluginConfig = {
  name: 'validation',
  plugin: validationPlugin,
  enabled: true,
  environments: ['development', 'production', 'test'],
};

declare module 'fastify' {
  interface FastifyInstance {
    validate: typeof createValidationHandler;
  }
}
