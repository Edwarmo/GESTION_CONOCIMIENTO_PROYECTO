import { Order } from '../../../core/entities/Order';
import { IOrderRepository } from '../../../core/repositories/interfaces/IOrderRepository';
import { GoogleSheetsClient } from '../google-sheets/GoogleSheetsClient';

/**
 * Implementación de IOrderRepository para Google Sheets
 * Solo maneja exportación, no consultas
 */
export class GoogleSheetsRepository implements IOrderRepository {
  constructor(private readonly sheetsClient: GoogleSheetsClient) {}

  async save(order: Order): Promise<Order> {
    // Google Sheets no es la fuente principal, solo exportación
    await this.exportToExternal(order);
    return order;
  }

  async exportToExternal(order: Order): Promise<void> {
    const row = order.toSheetRow();
    await this.sheetsClient.appendRows([row]);
  }

  async findById(id: string): Promise<Order | null> {
    throw new Error('findById no está implementado en GoogleSheetsRepository. Use PrismaOrderRepository.');
  }

  async findByCustomerPhone(phone: string): Promise<Order[]> {
    throw new Error('findByCustomerPhone no está implementado en GoogleSheetsRepository. Use PrismaOrderRepository.');
  }

  async findAll(limit?: number, offset?: number): Promise<Order[]> {
    throw new Error('findAll no está implementado en GoogleSheetsRepository. Use PrismaOrderRepository.');
  }
}
