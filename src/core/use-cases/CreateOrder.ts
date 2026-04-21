import { Order } from '../entities/Order';
import { IOrderRepository } from '../repositories/interfaces/IOrderRepository';
import { PhoneValidator } from '../validators/PhoneValidator';
import { ConsentValidator } from '../validators/ConsentValidator';
import {
  ValidationError,
  MissingFieldError,
  InvalidLengthError,
} from '../errors/ValidationError';

/**
 * DTO de entrada para la creación de pedidos
 */
export interface CreateOrderDTO {
  nombre: string;
  telefono: string;
  pedido: string;
  totalCop?: number | string;
  consentimiento: boolean;
}

/**
 * DTO de salida con información adicional del resultado
 */
export interface CreateOrderResult {
  order: Order;
  isNewCustomer: boolean;
  previousOrdersCount: number;
}

/**
 * Caso de Uso: Crear Pedido
 * 
 * Responsabilidades:
 * 1. Validar entrada según reglas de negocio
 * 2. Sanitizar y validar teléfono (Colombia)
 * 3. Validar consentimiento (Ley 1581/2012)
 * 4. Verificar historial del cliente
 * 5. Crear entidad de dominio
 * 6. Persistir en sistema principal (Prisma)
 * 7. Exportar a sistema analítico (Google Sheets) de forma asíncrona
 */
export class CreateOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: CreateOrderDTO): Promise<CreateOrderResult> {
    // ========== PASO 1: VALIDACIÓN DE ENTRADA ==========
    this.validateInput(dto);

    // ========== PASO 2: SANITIZACIÓN Y VALIDACIÓN DE TELÉFONO ==========
    const sanitizedPhone = PhoneValidator.sanitize(dto.telefono);
    PhoneValidator.validate(sanitizedPhone);

    // ========== PASO 3: VALIDACIÓN DE CONSENTIMIENTO (LEY 1581) ==========
    const consentTimestamp = ConsentValidator.validateWithTimestamp(
      dto.consentimiento
    );

    // ========== PASO 4: VERIFICAR HISTORIAL DEL CLIENTE ==========
    const existingOrders = await this.orderRepository.findByCustomerPhone(
      sanitizedPhone
    );
    const isNewCustomer = existingOrders.length === 0;
    const previousOrdersCount = existingOrders.length;

    // ========== PASO 5: CREAR ENTIDAD DE DOMINIO ==========
    const order = Order.create({
      customerName: dto.nombre.trim(),
      customerPhone: sanitizedPhone,
      details: dto.pedido.trim(),
      totalCop: dto.totalCop ? Number(dto.totalCop) : 0,
      consentGivenAt: consentTimestamp,
    });

    // ========== PASO 6: PERSISTENCIA PRINCIPAL (PRISMA) ==========
    const savedOrder = await this.orderRepository.save(order);

    // ========== PASO 7: EXPORTACIÓN ASÍNCRONA (GOOGLE SHEETS) ==========
    // No bloquea la respuesta al cliente
    this.orderRepository
      .exportToExternal(savedOrder)
      .catch((error) => {
        // En producción: enviar a sistema de monitoreo (Sentry, CloudWatch, Datadog)
        console.error('[CreateOrder] Error al exportar a Google Sheets:', {
          orderId: savedOrder.id,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      });

    return {
      order: savedOrder,
      isNewCustomer,
      previousOrdersCount,
    };
  }

  /**
   * Valida las reglas de negocio de entrada
   * @throws {ValidationError} Si alguna validación falla
   */
  private validateInput(dto: CreateOrderDTO): void {
    // Validar nombre
    if (!dto.nombre?.trim()) {
      throw new MissingFieldError('nombre');
    }

    if (dto.nombre.trim().length < 3) {
      throw new InvalidLengthError('nombre', 3, dto.nombre.trim().length);
    }

    // Validar teléfono
    if (!dto.telefono?.trim()) {
      throw new MissingFieldError('telefono');
    }

    // Validar pedido
    if (!dto.pedido?.trim()) {
      throw new MissingFieldError('pedido');
    }

    if (dto.pedido.trim().length < 10) {
      throw new InvalidLengthError('pedido', 10, dto.pedido.trim().length);
    }

    // Validar caracteres especiales peligrosos (prevención XSS básica)
    const dangerousPattern = /<script|javascript:|onerror=/i;
    if (
      dangerousPattern.test(dto.nombre) ||
      dangerousPattern.test(dto.pedido)
    ) {
      throw new ValidationError(
        'El contenido contiene caracteres no permitidos',
        'INVALID_CHARACTERS'
      );
    }
  }
}
