import { Order } from '../entities/Order';

/**
 * Contrato de repositorio para la entidad Order
 * Define las operaciones de persistencia sin especificar la implementación
 */
export interface IOrderRepository {
  /**
   * Persiste una orden en el sistema principal
   * @returns La orden persistida con metadatos actualizados
   */
  save(order: Order): Promise<Order>;

  /**
   * Exporta una orden a un sistema externo (ej. Google Sheets)
   * Esta operación debe ser asíncrona y no bloquear el flujo principal
   */
  exportToExternal(order: Order): Promise<void>;

  /**
   * Busca una orden por su identificador único
   * @returns La orden si existe, null en caso contrario
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Busca todas las órdenes de un cliente por su teléfono
   * @returns Array de órdenes ordenadas por fecha de creación (más reciente primero)
   */
  findByCustomerPhone(phone: string): Promise<Order[]>;

  /**
   * Obtiene todas las órdenes con paginación opcional
   * @param limit Número máximo de resultados (default: 100)
   * @param offset Número de registros a saltar (default: 0)
   */
  findAll(limit?: number, offset?: number): Promise<Order[]>;
}
