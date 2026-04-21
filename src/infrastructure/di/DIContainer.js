import { PrismaClient } from '@prisma/client';
import { CreateOrder } from '@core/use-cases/CreateOrder';
import { PrismaOrderRepository } from '../adapters/repositories/PrismaOrderRepository';
import { GoogleSheetsRepository } from '../adapters/repositories/GoogleSheetsRepository';
import { GoogleSheetsClient } from '../external-services/google-sheets/GoogleSheetsClient';
import { WhatsAppClient } from '../external-services/whatsapp/WhatsAppClient';

/**
 * Contenedor de Inyección de Dependencias
 * Patrón Singleton para gestionar instancias compartidas
 */
class DIContainer {
  static instance = null;
  
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasourceUrl: process.env.DATABASE_URL,
    });
    this.sheetsClient = new GoogleSheetsClient();
    this.whatsappClient = new WhatsAppClient();
  }

  static getInstance() {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // ==================== REPOSITORIES ====================

  getPrismaOrderRepository() {
    return new PrismaOrderRepository(this.prisma);
  }

  getGoogleSheetsRepository() {
    return new GoogleSheetsRepository(this.sheetsClient);
  }

  /**
   * Composite Repository Pattern
   * Combina Prisma (persistencia principal) + Google Sheets (exportación)
   */
  getCompositeOrderRepository() {
    const prismaRepo = this.getPrismaOrderRepository();
    const sheetsRepo = this.getGoogleSheetsRepository();

    return {
      save: async (order) => {
        const saved = await prismaRepo.save(order);
        // Exportación asíncrona no bloqueante
        sheetsRepo.exportToExternal(saved).catch(console.error);
        return saved;
      },
      exportToExternal: (order) => sheetsRepo.exportToExternal(order),
      findById: (id) => prismaRepo.findById(id),
      findByCustomerPhone: (phone) => prismaRepo.findByCustomerPhone(phone),
      findAll: (limit, offset) => prismaRepo.findAll(limit, offset),
    };
  }

  // ==================== USE CASES ====================

  getCreateOrderUseCase() {
    return new CreateOrder(this.getCompositeOrderRepository());
  }

  getWhatsAppClient() {
    return this.whatsappClient;
  }

  // ==================== CLEANUP ====================

  async dispose() {
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
