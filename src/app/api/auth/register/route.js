/**
 * app/api/auth/register/route.js
 * ENDPOINT DESHABILITADO - No se usa registro en el flujo simplificado
 */

import { NextResponse } from "next/server";

export async function POST(request) {
  return NextResponse.json(
    { error: "Endpoint deshabilitado." },
    { status: 410 }
  );
}
