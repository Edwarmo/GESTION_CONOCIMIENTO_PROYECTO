/**
 * lib/infrastructure/google-sheets/sheets-client.js
 *
 * Capa: INFRAESTRUCTURA
 * Propósito: Cliente HTTP para Google Sheets API (sin SDK pesado).
 * Usa la Apps Script Web App URL como endpoint intermedio para evitar
 * exponer credenciales OAuth en el cliente.
 *
 * Flujo:
 *   Next.js API Route (server) → POST → Google Apps Script → Google Sheets
 */

const SHEETS_ENDPOINT = process.env.GOOGLE_SHEETS_ENDPOINT;

/**
 * Agrega una fila a la hoja de Google Sheets especificada.
 * @param {string} sheetName - Nombre de la pestaña en el Spreadsheet
 * @param {Record<string, string|number>} rowData - Objeto con los datos a guardar
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function appendRowToSheet(sheetName, rowData) {
  if (!SHEETS_ENDPOINT) {
    console.warn("[sheets-client] GOOGLE_SHEETS_ENDPOINT no configurado.");
    return { success: false, error: "Endpoint de Google Sheets no configurado" };
  }

  try {
    const response = await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet: sheetName, data: rowData }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const json = await response.json();
    return { success: true, result: json };
  } catch (error) {
    console.error("[sheets-client] Error al escribir en Sheets:", error.message);
    return { success: false, error: error.message };
  }
}
