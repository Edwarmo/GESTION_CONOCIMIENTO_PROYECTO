/**
 * Clase base para todos los errores de dominio
 * Permite mapear errores de negocio a códigos HTTP específicos
 */
export abstract class DomainError extends Error {
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    
    // Mantiene el stack trace correcto en V8
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
