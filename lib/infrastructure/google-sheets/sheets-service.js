/**
 * lib/infrastructure/google-sheets/sheets-service.js
 *
 * Capa: INFRAESTRUCTURA — Servicio de negocio para Google Sheets
 * Propósito: Funciones de alto nivel que traducen entidades de la app
 *            a filas concretas en las pestañas del Spreadsheet.
 *
 * Sheet ID: 12bnYLbUbs-nEccL3hrfVA1zKS4k0n_1zfP72ej07KF8
 * Pestañas utilizadas:
 *   - "Usuarios"        → registros de SignUp
 *   - "PersonasExtra"   → registros de personas adicionales
 *   - "Pedidos"         → pedidos de WhatsApp
 */

import { appendRowToSheet } from "./sheets-client";

// ─── NOMBRES DE HOJAS ────────────────────────────────────────────────────────
export const SHEET_NAMES = {
  USERS: "Usuarios",
  EXTRA_PERSONS: "PersonasExtra",
  ORDERS: "Pedidos",
};

/**
 * Registra un nuevo usuario en la hoja "Usuarios".
 * @param {{ name: string, email: string, createdAt?: string }} user
 */
export async function logUserRegistration(user) {
  return appendRowToSheet(SHEET_NAMES.USERS, {
    Nombre: user.name ?? "",
    Email: user.email ?? "",
    FechaRegistro: user.createdAt ?? new Date().toISOString(),
    Rol: "USER",
  });
}

/**
 * Registra una persona adicional en la hoja "PersonasExtra".
 * @param {{ name: string, email: string, phone?: string, role?: string, notes?: string, createdBy?: string }} person
 */
export async function logExtraPersonRegistration(person) {
  return appendRowToSheet(SHEET_NAMES.EXTRA_PERSONS, {
    Nombre: person.name ?? "",
    Email: person.email ?? "",
    Telefono: person.phone ?? "",
    Rol: person.role ?? "VIEWER",
    Notas: person.notes ?? "",
    RegistradoPor: person.createdBy ?? "admin",
    Fecha: new Date().toISOString(),
  });
}

/**
 * Registra un pedido en la hoja "Pedidos".
 * @param {{ clientName: string, phone: string, order: string, totalCop: number }} pedido
 */
export async function logOrder(pedido) {
  return appendRowToSheet(SHEET_NAMES.ORDERS, {
    Cliente: pedido.clientName ?? "",
    Telefono: pedido.phone ?? "",
    Pedido: pedido.order ?? "",
    Fecha: new Date().toISOString(),
    Estado: "PENDIENTE",
    TotalCOP: pedido.totalCop ?? 0
  });
}
