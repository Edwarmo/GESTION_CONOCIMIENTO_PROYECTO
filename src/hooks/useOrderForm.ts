import { useState } from 'react';

export interface OrderFormData {
  nombre: string;
  telefono: string;
  pedido: string;
  totalCop: string;
  consentimiento: boolean;
}

export interface OrderFormState {
  data: OrderFormData;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface OrderFormResult {
  order: {
    id: string;
    customerName: string;
    customerPhone: string;
    details: string;
    status: string;
    createdAt: string;
  };
  isNewCustomer: boolean;
  previousOrdersCount: number;
}

/**
 * Hook personalizado para gestionar el formulario de pedidos
 * Separa la lógica de estado y validación de UI de la lógica de negocio
 */
export function useOrderForm() {
  const [state, setState] = useState<OrderFormState>({
    data: {
      nombre: '',
      telefono: '',
      pedido: '',
      totalCop: '',
      consentimiento: false,
    },
    loading: false,
    error: null,
    success: false,
  });

  const updateField = (field: keyof OrderFormData, value: string | boolean) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      error: null,
    }));
  };

  const submitOrder = async (): Promise<OrderFormResult> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Error al procesar el pedido');
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        data: {
          nombre: '',
          telefono: '',
          pedido: '',
          totalCop: '',
          consentimiento: false,
        },
      }));

      return result.data;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al procesar el pedido',
      }));
      throw error;
    }
  };

  const reset = () => {
    setState({
      data: {
        nombre: '',
        telefono: '',
        pedido: '',
        totalCop: '',
        consentimiento: false,
      },
      loading: false,
      error: null,
      success: false,
    });
  };

  return {
    ...state,
    updateField,
    submitOrder,
    reset,
  };
}
