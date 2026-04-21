/**
 * app/api/persons/route.js
 * ENDPOINT DESHABILITADO - No se usa en el flujo simplificado
 */

import { NextResponse } from "next/server";

export async function POST(request) {
  return NextResponse.json(
    { error: "Endpoint deshabilitado." },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Endpoint deshabilitado." },
    { status: 410 }
  );
}
