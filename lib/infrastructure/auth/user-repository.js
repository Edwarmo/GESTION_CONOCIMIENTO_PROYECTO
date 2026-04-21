/**
 * lib/infrastructure/auth/user-repository.js
 *
 * Capa: INFRAESTRUCTURA — Repositorio de Usuarios
 * Propósito: Abstrae el acceso a la base de datos para operaciones de usuario.
 *            Desacopla NextAuth y las API routes de Prisma directamente.
 */

import { prisma } from "@/lib/database";

/**
 * Busca un usuario por email.
 * @param {string} email
 */
export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Crea un nuevo usuario con contraseña hasheada.
 * @param {{ name: string, email: string, hashedPassword: string }} data
 */
export async function createUser({ name, email, hashedPassword }) {
  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER",
    },
  });
}

/**
 * Lista todos los usuarios registrados (sin devolver passwords).
 */
export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}
