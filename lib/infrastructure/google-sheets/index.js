/**
 * lib/infrastructure/google-sheets/index.js
 * Barrel export — capa google-sheets
 */
export { appendRowToSheet } from "./sheets-client";
export {
  logUserRegistration,
  logExtraPersonRegistration,
  logOrder,
  SHEET_NAMES,
} from "./sheets-service";
