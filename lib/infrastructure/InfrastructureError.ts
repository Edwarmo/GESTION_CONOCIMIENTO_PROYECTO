/**
 * Clase base para errores de infraestructura
 * Encapsula errores técnicos (DB, APIs externas, red, etc.)
 */
export class InfrastructureError extends Error {
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'InfrastructureError';
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      originalError: this.originalError instanceof Error
        ? {
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : String(this.originalError),
    };
  }
}

/**
 * Error de base de datos (Prisma)
 */
export class DatabaseError extends InfrastructureError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'DATABASE_ERROR', originalError);
    this.name = 'DatabaseError';
  }
}

/**
 * Error de servicio externo (Google Sheets, WhatsApp API, etc.)
 */
export class ExternalServiceError extends InfrastructureError {
  constructor(
    public readonly serviceName: string,
    message: string,
    originalError?: unknown
  ) {
    super(message, 'EXTERNAL_SERVICE_ERROR', originalError);
    this.name = 'ExternalServiceError';
  }
}
