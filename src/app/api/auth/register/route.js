/**
 * app/api/auth/register/route.js
 *
 * API Route: POST /api/auth/register
 * Registra un usuario nuevo en la BD Y escribe en Google Sheets (hoja "Usuarios").
 *
 * Capa:
 *   → lib/infrastructure/auth/user-repository  (BD)
 *   → lib/infrastructure/google-sheets         (Sheets)
 */

import { NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@infrastructure/adapters/auth/user-repository";
import { logUserRegistration } from "@infrastructure/external-services/google-sheets/sheets-service";

let bcrypt;
try {
  bcrypt = require("bcryptjs");
} catch {
  bcrypt = null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // ── Validación básica ──────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    // ── Verificar duplicado ────────────────────────────────────────────────
    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      );
    }

    // ── Hash de contraseña ─────────────────────────────────────────────────
    if (!bcrypt) {
      return NextResponse.json(
        { error: "Servidor no configurado (bcryptjs faltante)." },
        { status: 500 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Crear en BD ────────────────────────────────────────────────────────
    const user = await createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      hashedPassword,
    });

    // ── Registrar en Google Sheets (no bloquea si falla) ──────────────────
    await logUserRegistration({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt?.toISOString(),
    }).catch((err) =>
      console.warn("[register] Sheets write failed (non-critical):", err.message)
    );

    return NextResponse.json(
      { message: "Cuenta creada con éxito.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
