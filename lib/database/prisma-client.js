/**
 * lib/database/prisma-client.js
 * 
 * Capa: DATABASE
 * Propósito: Singleton del cliente Prisma para evitar múltiples conexiones
 * en modo desarrollo con Next.js hot-reload.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
