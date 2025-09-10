export { BaseError } from './BaseError';
export {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
} from './ApplicationErrors';
export {
  InvalidSignatureError,
  InvalidCommandError,
  SessionStateError,
  TenantNotActiveError,
  AFIPConfigurationError,
} from './WhatsAppErrors';
