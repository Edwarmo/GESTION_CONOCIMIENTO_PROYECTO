import { DomainError } from './DomainError';

/**
 * Error de validación de reglas de negocio
 */
export class ValidationError extends DomainError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code, 400);
  }
}

/**
 * Error específico: consentimiento no otorgado (Ley 1581/2012)
 */
export class ConsentRequiredError extends ValidationError {
  constructor() {
    super(
      'Debe aceptar la política de tratamiento de datos personales conforme a la Ley 1581 de 2012',
      'CONSENT_REQUIRED'
    );
  }
}

/**
 * Error específico: formato de teléfono inválido
 */
export class InvalidPhoneError extends ValidationError {
  constructor(phone?: string) {
    super(
      `El teléfono debe tener exactamente 10 dígitos numéricos${phone ? ` (recibido: ${phone})` : ''}`,
      'INVALID_PHONE_FORMAT'
    );
  }
}

/**
 * Error específico: campo requerido faltante
 */
export class MissingFieldError extends ValidationError {
  constructor(fieldName: string) {
    super(
      `El campo '${fieldName}' es obligatorio`,
      `MISSING_${fieldName.toUpperCase()}`
    );
  }
}

/**
 * Error específico: longitud de campo inválida
 */
export class InvalidLengthError extends ValidationError {
  constructor(fieldName: string, minLength: number, actualLength: number) {
    super(
      `El campo '${fieldName}' debe tener al menos ${minLength} caracteres (actual: ${actualLength})`,
      `INVALID_${fieldName.toUpperCase()}_LENGTH`
    );
  }
}
