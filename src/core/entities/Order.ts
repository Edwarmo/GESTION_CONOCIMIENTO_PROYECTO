/**
 * Estados posibles de una orden en el sistema
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

/**
 * Propiedades inmutables de una orden
 */
export interface OrderProps {
  readonly id: string;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly details: string;
  readonly totalCop: number;
  status: OrderStatus;
  readonly consentGivenAt: Date;
  readonly createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de dominio: Order
 * Encapsula la lógica de negocio relacionada con pedidos
 */
export class Order {
  private constructor(private props: OrderProps) {
    Object.freeze(this.props.id);
    Object.freeze(this.props.customerName);
    Object.freeze(this.props.customerPhone);
    Object.freeze(this.props.details);
    Object.freeze(this.props.totalCop);
    Object.freeze(this.props.consentGivenAt);
    Object.freeze(this.props.createdAt);
  }

  /**
   * Factory method: crea una nueva orden
   */
  static create(data: {
    customerName: string;
    customerPhone: string;
    details: string;
    totalCop?: number;
    consentGivenAt: Date;
  }): Order {
    const now = new Date();

    return new Order({
      id: crypto.randomUUID(),
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone,
      details: data.details.trim(),
      totalCop: data.totalCop || 0,
      status: OrderStatus.PENDING,
      consentGivenAt: data.consentGivenAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method: reconstruye una orden desde persistencia
   */
  static fromPersistence(props: OrderProps): Order {
    return new Order(props);
  }

  // ==================== GETTERS ====================

  get id(): string {
    return this.props.id;
  }

  get customerName(): string {
    return this.props.customerName;
  }

  get customerPhone(): string {
    return this.props.customerPhone;
  }

  get details(): string {
    return this.props.details;
  }

  get totalCop(): number {
    return this.props.totalCop;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get consentGivenAt(): Date {
    return this.props.consentGivenAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ==================== LÓGICA DE NEGOCIO ====================

  /**
   * Verifica si la orden puede ser cancelada
   * Regla de negocio: solo pedidos pendientes o confirmados pueden cancelarse
   */
  canBeCancelled(): boolean {
    return (
      this.props.status === OrderStatus.PENDING ||
      this.props.status === OrderStatus.CONFIRMED
    );
  }

  /**
   * Confirma un pedido pendiente
   * @throws {Error} Si el pedido no está en estado PENDING
   */
  confirm(): void {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new Error(
        `No se puede confirmar un pedido en estado '${this.props.status}'. Solo pedidos pendientes pueden ser confirmados.`
      );
    }

    this.props.status = OrderStatus.CONFIRMED;
    this.props.updatedAt = new Date();
  }

  /**
   * Marca un pedido como entregado
   * @throws {Error} Si el pedido no está en estado CONFIRMED
   */
  deliver(): void {
    if (this.props.status !== OrderStatus.CONFIRMED) {
      throw new Error(
        `No se puede entregar un pedido en estado '${this.props.status}'. Solo pedidos confirmados pueden ser entregados.`
      );
    }

    this.props.status = OrderStatus.DELIVERED;
    this.props.updatedAt = new Date();
  }

  /**
   * Cancela un pedido
   * @throws {Error} Si el pedido no puede ser cancelado
   */
  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error(
        `No se puede cancelar un pedido en estado '${this.props.status}'. Solo pedidos pendientes o confirmados pueden ser cancelados.`
      );
    }

    this.props.status = OrderStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica si el consentimiento sigue siendo válido
   */
  hasValidConsent(maxAgeMonths: number = 6): boolean {
    const now = new Date();
    const monthsDiff =
      (now.getTime() - this.props.consentGivenAt.getTime()) /
      (1000 * 60 * 60 * 24 * 30);
    return monthsDiff <= maxAgeMonths;
  }

  // ==================== SERIALIZACIÓN ====================

  /**
   * Convierte la entidad a un objeto plano (para persistencia)
   */
  toJSON(): OrderProps {
    return { ...this.props };
  }

  /**
   * Convierte la entidad a formato de fila de Google Sheets
   * Compatible con el esquema de la hoja "Pedidos":
   * Cliente, Telefono, Pedido, Fecha, Estado, TotalCOP
   */
  toSheetRow(): Record<string, string | number> {
    return {
      Cliente: this.props.customerName,
      Telefono: this.props.customerPhone,
      Pedido: this.props.details,
      Fecha: this.props.createdAt.toISOString(),
      Estado: this.props.status.toUpperCase(),
      TotalCOP: this.props.totalCop,
    };
  }

  /**
   * Representación en string para debugging
   */
  toString(): string {
    return `Order(id=${this.props.id}, customer=${this.props.customerName}, status=${this.props.status})`;
  }
}
