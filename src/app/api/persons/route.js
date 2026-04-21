/**
 * app/api/persons/route.js
 *
 * API Route: POST /api/persons
 * Registra una persona adicional en la BD Y en Google Sheets (hoja "PersonasExtra").
 *
 * API Route: GET /api/persons
 * Lista todas las personas adicionales registradas.
 */

import { NextResponse } from "next/server";
import {
  createRegisteredPerson,
  findPersonByEmail,
  listRegisteredPersons,
} from "@infrastructure/adapters/auth/person-repository";
import { logExtraPersonRegistration } from "@infrastructure/external-services/google-sheets/sheets-service";

// ─── POST ────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, notes, createdBy } = body;

    // Validación
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Nombre y email son obligatorios." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    // Verificar duplicado
    const existing = await findPersonByEmail(email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una persona registrada con ese email." },
        { status: 409 }
      );
    }

    // Guardar en BD
    const person = await createRegisteredPerson({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() ?? null,
      role: role ?? "VIEWER",
      notes: notes?.trim() ?? null,
      createdBy: createdBy ?? null,
    });

    // Registrar en Google Sheets (no bloquea si falla)
    await logExtraPersonRegistration({
      name: person.name,
      email: person.email,
      phone: person.phone,
      role: person.role,
      notes: person.notes,
      createdBy: person.createdBy,
    }).catch((err) =>
      console.warn("[persons] Sheets write failed (non-critical):", err.message)
    );

    return NextResponse.json(
      { message: "Persona registrada con éxito.", personId: person.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/persons]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const persons = await listRegisteredPersons();
    return NextResponse.json({ persons }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/persons]", error);
    return NextResponse.json({ error: "Error al obtener personas." }, { status: 500 });
  }
}
