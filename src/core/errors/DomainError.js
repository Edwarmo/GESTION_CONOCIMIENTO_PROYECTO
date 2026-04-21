/**
 * src/core/errors/DomainError.js
 *
 * Clase base para todos los errores de dominio.
 * Mapea errores de negocio a códigos HTTP.
 */
export class DomainError extends Error {
  /**
   * @param {string} code    Código máquina (ej. "CONSENT_REQUIRED")
   * @param {string} message Mensaje humano
   * @param {number} statusCode HTTP status (default 400)
   */
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
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
