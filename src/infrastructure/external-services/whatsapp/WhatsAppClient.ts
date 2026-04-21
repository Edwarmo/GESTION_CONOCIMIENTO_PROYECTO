import { config } from '../../config';

export class WhatsAppClient {
  private readonly adminPhone: string;

  constructor() {
    this.adminPhone = config.whatsapp.adminPhone;
  }

  /**
   * Genera el enlace de WhatsApp (wa.me) para enviar un mensaje con la orden pre-formateada.
   */
  generateOrderLink(customerName: string, customerPhone: string, orderDetails: string): string {
    const message = `¡Hola! Nuevo pedido 📦\n\n*Cliente:* ${customerName}\n*Tel:* ${customerPhone}\n\n*Pedido:*\n${orderDetails}`;
    return `https://wa.me/${this.adminPhone}?text=${encodeURIComponent(message)}`;
  }
}
