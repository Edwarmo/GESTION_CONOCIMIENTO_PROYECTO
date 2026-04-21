import { ConsentRequiredError } from '../errors/ValidationError';

/**
 * Validador de consentimiento para cumplimiento de Ley 1581/2012
 * (Habeas Data - Colombia)
 */
export class ConsentValidator {
  /**
   * Valida que el consentimiento haya sido otorgado
   * @throws {ConsentRequiredError} Si el consentimiento no fue otorgado
   */
  static validate(consentGiven: boolean): void {
    if (!consentGiven) {
      throw new ConsentRequiredError();
    }
  }

  /**
   * Valida el consentimiento y retorna el timestamp de aceptación
   * @returns Fecha y hora exacta del consentimiento
   */
  static validateWithTimestamp(consentGiven: boolean): Date {
    this.validate(consentGiven);
    return new Date();
  }

  /**
   * Verifica si un consentimiento sigue siendo válido
   * Según mejores prácticas, el consentimiento debe renovarse cada 6 meses
   */
  static isConsentValid(consentDate: Date, maxAgeMonths: number = 6): boolean {
    const now = new Date();
    const monthsDiff = (now.getTime() - consentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsDiff <= maxAgeMonths;
  }
}
