import { PrismaClient } from '@prisma/client';
import { Order, OrderStatus } from '../../../core/entities/Order';
import { IOrderRepository } from '../../../core/repositories/interfaces/IOrderRepository';
import { DatabaseError } from '../InfrastructureError';

/**
 * Implementación de IOrderRepository usando Prisma ORM
 * Responsable de la persistencia en PostgreSQL/MySQL
 */
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(order: Order): Promise<Order> {
    try {
      const data = order.toJSON();

      const prismaOrder = await this.prisma.order.create({
        data: {
          id: data.id,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          details: data.details,
          status: data.status,
          consentGivenAt: data.consentGivenAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      });

      return this.toDomain(prismaOrder);
    } catch (error) {
      throw new DatabaseError(
        'Error al guardar la orden en la base de datos',
        error
      );
    }
  }

  async exportToExternal(order: Order): Promise<void> {
    // Este método no se implementa aquí porque Prisma no maneja Google Sheets
    // La exportación se delega al GoogleSheetsRepository en el DIContainer
    throw new Error(
      'exportToExternal no está implementado en PrismaOrderRepository. Use el composite repository del DIContainer.'
    );
  }

  async findById(id: string): Promise<Order | null> {
    try {
      const prismaOrder = await this.prisma.order.findUnique({
        where: { id },
      });

      return prismaOrder ? this.toDomain(prismaOrder) : null;
    } catch (error) {
      throw new DatabaseError('Error al buscar la orden por ID', error);
    }
  }

  async findByCustomerPhone(phone: string): Promise<Order[]> {
    try {
      const prismaOrders = await this.prisma.order.findMany({
        where: { customerPhone: phone },
        orderBy: { createdAt: 'desc' },
      });

      return prismaOrders.map(this.toDomain);
    } catch (error) {
      throw new DatabaseError('Error al buscar órdenes por teléfono', error);
    }
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<Order[]> {
    try {
      const prismaOrders = await this.prisma.order.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return prismaOrders.map(this.toDomain);
    } catch (error) {
      throw new DatabaseError('Error al obtener todas las órdenes', error);
    }
  }

  private toDomain(prismaOrder: any): Order {
    return Order.fromPersistence({
      id: prismaOrder.id,
      customerName: prismaOrder.customerName,
      customerPhone: prismaOrder.customerPhone,
      details: prismaOrder.details,
      status: prismaOrder.status as OrderStatus,
      consentGivenAt: prismaOrder.consentGivenAt,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
    });
  }
}
