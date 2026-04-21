/**
 * app/api/orders/route.ts
 *
 * API Route: POST /api/orders
 * Adaptador de entrada que invoca el caso de uso CreateOrder
 * Maneja errores de dominio e infraestructura con códigos HTTP apropiados
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/infrastructure/di/DIContainer';
import { DomainError } from '@/core/errors/DomainError';
import { InfrastructureError } from '@/lib/infrastructure/InfrastructureError';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Obtener caso de uso desde el contenedor DI
    const createOrderUseCase = container.getCreateOrderUseCase();

    // Ejecutar lógica de negocio
    const result = await createOrderUseCase.execute(body);

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
    // Manejo centralizado de errores
    if (error instanceof DomainError) {
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
    console.error('[POST /api/orders] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error inesperado del servidor',
          code: 'UNKNOWN_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
