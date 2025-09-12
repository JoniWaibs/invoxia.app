import { BaseError } from './BaseError';

export class InvalidSignatureError extends BaseError {
  readonly statusCode = 403;
  readonly code = 'INVALID_SIGNATURE';
  readonly isOperational = true;

  constructor(requestId?: string) {
    super('Invalid X-Hub-Signature-256', requestId);
  }
}

export class InvalidCommandError extends BaseError {
  readonly statusCode = 400;
  readonly code = 'INVALID_COMMAND';
  readonly isOperational = true;

  constructor(command: string, requestId?: string) {
    super(
      `Comando no reconocido: ${command}. Envía AYUDA para ver comandos disponibles.`,
      requestId
    );
  }
}

export class SessionStateError extends BaseError {
  readonly statusCode = 400;
  readonly code = 'INVALID_SESSION_STATE';
  readonly isOperational = true;

  constructor(currentState: string, expectedState: string, requestId?: string) {
    super(
      `Estado de sesión inválido. Estado actual: ${currentState}, esperado: ${expectedState}`,
      requestId
    );
  }
}

export class TenantNotActiveError extends BaseError {
  readonly statusCode = 400;
  readonly code = 'NO_ACTIVE_TENANT';
  readonly isOperational = true;

  constructor(requestId?: string) {
    super(
      'No tienes una firma activa. Usa CREAR FIRMA o CAMBIAR FIRMA.',
      requestId
    );
  }
}

export class AFIPConfigurationError extends BaseError {
  readonly statusCode = 400;
  readonly code = 'AFIP_CONFIG_ERROR';
  readonly isOperational = true;

  constructor(missingField: string, requestId?: string) {
    super(`Configuración AFIP incompleta. Falta: ${missingField}`, requestId);
  }
}
