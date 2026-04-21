export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  price: number;
  quantity: number;
  product?: Product;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  items?: OrderItem[];
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}
