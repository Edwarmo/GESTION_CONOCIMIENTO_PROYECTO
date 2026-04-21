/**
 * lib/infrastructure/auth/person-repository.js
 *
 * Capa: INFRAESTRUCTURA — Repositorio de Personas Adicionales
 * Propósito: CRUD para el modelo RegisteredPerson.
 */

import { prisma } from "@infrastructure/database";

/**
 * Crea una persona adicional en la BD.
 * @param {{ name: string, email: string, phone?: string, role?: string, notes?: string, createdBy?: string }} data
 */
export async function createRegisteredPerson(data) {
  return prisma.registeredPerson.create({ data });
}

/**
 * Verifica si ya existe una persona con ese email.
 * @param {string} email
 */
export async function findPersonByEmail(email) {
  return prisma.registeredPerson.findUnique({ where: { email } });
}

/**
 * Lista todas las personas registradas.
 */
export async function listRegisteredPersons() {
  return prisma.registeredPerson.findMany({
    orderBy: { createdAt: "desc" },
  });
}
