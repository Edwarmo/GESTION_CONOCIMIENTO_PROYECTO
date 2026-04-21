import { PrismaClient } from '@prisma/client';
import { CreateOrder } from '@core/use-cases/CreateOrder';
import { PrismaOrderRepository } from '../adapters/repositories/PrismaOrderRepository';
import { GoogleSheetsRepository } from '../adapters/repositories/GoogleSheetsRepository';
import { GoogleSheetsClient } from '../external-services/google-sheets/GoogleSheetsClient';
import { WhatsAppClient } from '../external-services/whatsapp/WhatsAppClient';
import { IOrderRepository } from '@core/repositories/interfaces/IOrderRepository';
import { Order } from '@core/entities/Order';

/**
 * Contenedor de Inyección de Dependencias
 * Patrón Singleton para gestionar instancias compartidas
 */
class DIContainer {
  private static instance: DIContainer;
  private prisma: PrismaClient;
  private sheetsClient: GoogleSheetsClient;
  private whatsappClient: WhatsAppClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasourceUrl: process.env.DATABASE_URL,
    });
    this.sheetsClient = new GoogleSheetsClient();
    this.whatsappClient = new WhatsAppClient();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // ==================== REPOSITORIES ====================

  getPrismaOrderRepository(): PrismaOrderRepository {
    return new PrismaOrderRepository(this.prisma);
  }

  getGoogleSheetsRepository(): GoogleSheetsRepository {
    return new GoogleSheetsRepository(this.sheetsClient);
  }

  /**
   * Composite Repository Pattern
   * Combina Prisma (persistencia principal) + Google Sheets (exportación)
   */
  getCompositeOrderRepository(): IOrderRepository {
    const prismaRepo = this.getPrismaOrderRepository();
    const sheetsRepo = this.getGoogleSheetsRepository();

    return {
      save: async (order: Order) => {
        const saved = await prismaRepo.save(order);
        // Exportación asíncrona no bloqueante
        sheetsRepo.exportToExternal(saved).catch(console.error);
        return saved;
      },
      exportToExternal: (order: Order) => sheetsRepo.exportToExternal(order),
      findById: (id: string) => prismaRepo.findById(id),
      findByCustomerPhone: (phone: string) => prismaRepo.findByCustomerPhone(phone),
      findAll: (limit?: number, offset?: number) => prismaRepo.findAll(limit, offset),
    };
  }

  // ==================== USE CASES ====================

  getCreateOrderUseCase(): CreateOrder {
    return new CreateOrder(this.getCompositeOrderRepository());
  }

  getWhatsAppClient(): WhatsAppClient {
    return this.whatsappClient;
  }

  // ==================== CLEANUP ====================

  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const container = DIContainer.getInstance();

// Cleanup en shutdown del proceso
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await container.dispose();
  });

  process.on('SIGINT', async () => {
    await container.dispose();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await container.dispose();
    process.exit(0);
  });
}
