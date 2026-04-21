/**
 * lib/index.js
 * Barrel raíz de la capa lib.
 * Arquitectura en capas:
 *   lib/
 *   ├── database/        → Prisma singleton (acceso a BD)
 *   └── infrastructure/  → Repositorios + servicios externos (Google Sheets, Auth)
 */
export * from "./database";
export * from "./infrastructure";
