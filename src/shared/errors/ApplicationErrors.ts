import { BaseError } from './BaseError';

export class ValidationError extends BaseError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';
  readonly isOperational = true;

  constructor(message: string, requestId?: string) {
    super(message, requestId);
  }
}

export class AuthenticationError extends BaseError {
  readonly statusCode = 401;
  readonly code = 'AUTHENTICATION_ERROR';
  readonly isOperational = true;

  constructor(message: string = 'Authentication required', requestId?: string) {
    super(message, requestId);
  }
}

export class AuthorizationError extends BaseError {
  readonly statusCode = 403;
  readonly code = 'AUTHORIZATION_ERROR';
  readonly isOperational = true;

  constructor(
    message: string = 'Insufficient permissions',
    requestId?: string
  ) {
    super(message, requestId);
  }
}

export class UnauthorizedError extends BaseError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';
  readonly isOperational = true;

  constructor(message: string = 'Unauthorized access', requestId?: string) {
    super(message, requestId);
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
  readonly isOperational = true;

  constructor(resource: string, identifier?: string, requestId?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, requestId);
  }
}

export class ConflictError extends BaseError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
  readonly isOperational = true;

  constructor(message: string, requestId?: string) {
    super(message, requestId);
  }
}

export class RateLimitError extends BaseError {
  readonly statusCode = 429;
  readonly code = 'RATE_LIMIT_EXCEEDED';
  readonly isOperational = true;

  constructor(message: string = 'Rate limit exceeded', requestId?: string) {
    super(message, requestId);
  }
}

export class InternalServerError extends BaseError {
  readonly statusCode = 500;
  readonly code = 'INTERNAL_SERVER_ERROR';
  readonly isOperational = false;

  constructor(message: string = 'Internal server error', requestId?: string) {
    super(message, requestId);
  }
}
