/**
 * app/api/orders/route.js
 *
 * API Route: POST /api/orders
 * Adaptador de entrada que invoca el caso de uso CreateOrder
 * Maneja errores de dominio e infraestructura con códigos HTTP apropiados
 */

import { NextResponse } from 'next/server';
import { container } from '@/lib/infrastructure/di/DIContainer.js';
import { DomainError } from '@/core/errors/DomainError';
import { InfrastructureError } from '@/lib/infrastructure/InfrastructureError';

export async function POST(request) {
  try {
    console.log('[POST /api/orders] Iniciando...');
    const body = await request.json();
    console.log('[POST /api/orders] Body recibido:', body);

    // Obtener caso de uso desde el contenedor DI
    console.log('[POST /api/orders] Obteniendo caso de uso...');
    const createOrderUseCase = container.getCreateOrderUseCase();
    console.log('[POST /api/orders] Caso de uso obtenido');

    // Ejecutar lógica de negocio
    console.log('[POST /api/orders] Ejecutando caso de uso...');
    const result = await createOrderUseCase.execute(body);
    console.log('[POST /api/orders] Caso de uso ejecutado exitosamente');

    return NextResponse.json(
      {
        success: true,
        data: {
          order: result.order.toJSON(),
          isNewCustomer: result.isNewCustomer,
          previousOrdersCount: result.previousOrdersCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/orders] ERROR CAPTURADO:', error);
    console.error('[POST /api/orders] Error name:', error.name);
    console.error('[POST /api/orders] Error message:', error.message);
    console.error('[POST /api/orders] Error stack:', error.stack);
    
    // Manejo centralizado de errores
    if (error instanceof DomainError) {
      console.log('[POST /api/orders] Es un DomainError');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof InfrastructureError) {
      console.log('[POST /api/orders] Es un InfrastructureError');
      console.error('[POST /api/orders] Infrastructure error:', error.toJSON());
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Error en el sistema. Por favor intente nuevamente.',
            code: 'INTERNAL_ERROR',
          },
        },
        { status: 500 }
      );
    }

    // Error desconocido
    console.log('[POST /api/orders] Es un error desconocido');
    console.error('[POST /api/orders] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Error inesperado del servidor',
          code: 'UNKNOWN_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    const orderRepository = container.getPrismaOrderRepository();

    const orders = phone
      ? await orderRepository.findByCustomerPhone(phone)
      : await orderRepository.findAll(50, 0);

    return NextResponse.json({
      success: true,
      data: orders.map((order) => order.toJSON()),
    });
  } catch (error) {
    console.error('[GET /api/orders] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener pedidos',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
