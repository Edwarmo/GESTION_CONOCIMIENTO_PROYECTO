import { InvalidPhoneError } from '../errors/ValidationError';

/**
 * Validador de números telefónicos colombianos
 * Formato esperado: 10 dígitos numéricos (ej. 3001234567)
 */
export class PhoneValidator {
  private static readonly COLOMBIA_PHONE_REGEX = /^\d{10}$/;
  private static readonly COLOMBIA_MOBILE_PREFIXES = [
    '300', '301', '302', '303', '304', '305', 
    '310', '311', '312', '313', '314', '315', '316', '317', '318', '319',
    '320', '321', '322', '323', '324', 
    '350', '351'
  ];

  /**
   * Valida que el teléfono cumpla con el formato colombiano
   * @throws {InvalidPhoneError} Si el formato es inválido
   */
  static validate(phone: string): void {
    const sanitized = this.sanitize(phone);
    
    if (!this.COLOMBIA_PHONE_REGEX.test(sanitized)) {
      throw new InvalidPhoneError(phone);
    }

    // Validación adicional: verificar prefijo de móvil colombiano
    const prefix = sanitized.substring(0, 3);
    if (!this.COLOMBIA_MOBILE_PREFIXES.includes(prefix)) {
      throw new InvalidPhoneError(phone);
    }
  }

  /**
   * Sanitiza el teléfono removiendo caracteres no numéricos
   * @returns Teléfono con solo dígitos (máximo 10)
   */
  static sanitize(phone: string): string {
    return phone.replace(/\D/g, '').slice(0, 10);
  }

  /**
   * Verifica si un teléfono es válido sin lanzar excepciones
   */
  static isValid(phone: string): boolean {
    try {
      this.validate(phone);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Formatea un teléfono para visualización
   * @example formatForDisplay('3001234567') => '300 123 4567'
   */
  static formatForDisplay(phone: string): string {
    const sanitized = this.sanitize(phone);
    if (sanitized.length !== 10) return phone;
    
    return `${sanitized.slice(0, 3)} ${sanitized.slice(3, 6)} ${sanitized.slice(6)}`;
  }
}
