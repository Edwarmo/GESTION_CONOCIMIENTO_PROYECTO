import { config } from '../../config';
import { ExternalServiceError } from '../InfrastructureError';

/**
 * Estructura de una fila para Google Sheets
 */
export interface SheetRow {
  [key: string]: string | number;
}

/**
 * Respuesta del Google Apps Script Web App
 */
interface WebAppResponse {
  success: boolean;
  message?: string;
  error?: string;
  sheet?: string;
}

/**
 * Cliente HTTP para interactuar con Google Sheets via Web App
 * Compatible con el Google Apps Script de Feelback
 */
export class GoogleSheetsClient {
  private readonly webAppUrl: string;
  private readonly spreadsheetId: string;
  private readonly timeout: number = 10000; // 10 segundos

  constructor() {
    this.webAppUrl = config.googleSheets.webAppUrl;
    this.spreadsheetId = config.googleSheets.spreadsheetId;
  }

  /**
   * Agrega una fila a la hoja "Pedidos"
   * Formato esperado por el Google Apps Script:
   * { sheet: "Pedidos", data: { Cliente, Telefono, Pedido, Fecha, Estado, TotalCOP } }
   */
  async appendOrderRow(data: {
    Cliente: string;
    Telefono: string;
    Pedido: string;
    Fecha: string;
    Estado: string;
    TotalCOP: number;
  }): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheet: 'Pedidos',
          data,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      const result: WebAppResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido en Google Sheets');
      }

      if (config.app.isDevelopment) {
        console.log(`✓ Google Sheets: Pedido agregado a hoja "${result.sheet}"`);
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ExternalServiceError(
          'Google Sheets',
          `Timeout después de ${this.timeout}ms`,
          error
        );
      }

      throw new ExternalServiceError(
        'Google Sheets',
        'Error al sincronizar con Google Sheets',
        error
      );
    }
  }

  /**
   * Método genérico para agregar filas (mantiene compatibilidad)
   * @deprecated Usar appendOrderRow para pedidos
   */
  async appendRows(rows: SheetRow[]): Promise<void> {
    // Por ahora, solo soportamos un pedido a la vez
    if (rows.length === 0) return;
    
    const row = rows[0];
    await this.appendOrderRow({
      Cliente: String(row.cliente || ''),
      Telefono: String(row.telefono || ''),
      Pedido: String(row.pedido || ''),
      Fecha: String(row.fecha || new Date().toISOString()),
      Estado: String(row.estado || 'PENDIENTE'),
      TotalCOP: Number(row.totalCOP || 0),
    });
  }

  /**
   * Verifica la conectividad con el Web App
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) return false;
      
      const result = await response.json();
      return result.status === 'ok' && result.proyecto?.includes('Feelback');
    } catch {
      return false;
    }
  }
}
