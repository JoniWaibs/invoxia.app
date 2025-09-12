import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import {
  BaseError,
  InternalServerError,
  ValidationError,
} from '@shared/errors';
import { v4 as uuidv4 } from 'uuid';
import type { PluginConfig } from '@models/plugins';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
    requestId: string;
  };
}

export interface WhatsAppErrorResponse {
  message: string;
}

const errorHandler = async (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const requestId = request.headers['x-request-id'] as string;

  // Set request ID if not present
  if (!requestId) {
    request.headers['x-request-id'] = uuidv4();
  }

  let appError: BaseError;

  if (error instanceof BaseError) {
    appError = error;
  } else {
    if (error.name === 'ZodError') {
      appError = new ValidationError(
        `Validation failed: ${error.message}`,
        requestId
      );
    } else {
      appError = new InternalServerError(
        'An unexpected error occurred',
        requestId
      );
    }
  }

  const logLevel = appError.isOperational ? 'warn' : 'error';
  const logMessage = `${appError.isOperational ? 'Operational' : 'Non-operational'} error occurred`;

  request.log[logLevel](
    {
      error: {
        name: appError.name,
        message: appError.message,
        code: appError.code,
        statusCode: appError.statusCode,
        requestId,
        ...(logLevel === 'error' && { stack: appError.stack }),
      },
    },
    logMessage
  );

  // Handle WhatsApp webhook routes differently
  const isWhatsAppWebhook = request.routeOptions.url?.startsWith('/wa/webhook');

  if (isWhatsAppWebhook) {
    const whatsAppResponse: WhatsAppErrorResponse = {
      message: appError.message,
    };

    return reply
      .status(200) // Always return 200 for WhatsApp webhooks to avoid retries
      .send(whatsAppResponse);
  }

  const errorResponse: ErrorResponse = {
    error: {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      requestId,
    },
  };

  return reply.status(appError.statusCode).send(errorResponse);
};

export const errorHandlerPlugin: PluginConfig = {
  name: 'errorHandler',
  plugin: async (fastify: FastifyInstance) => {
    fastify.setErrorHandler(errorHandler);
  },
  enabled: true,
  environments: ['development', 'production', 'test'],
};
