/**
 * app/api/orders/route.js
 * ENDPOINT DESHABILITADO - El formulario envía directo a Google Sheets
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Este endpoint está deshabilitado. El formulario envía directo a Google Sheets.',
        code: 'ENDPOINT_DISABLED',
      },
    },
    { status: 410 }
  );
}

export async function GET(request) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Este endpoint está deshabilitado.',
        code: 'ENDPOINT_DISABLED',
      },
    },
    { status: 410 }
  );
}
