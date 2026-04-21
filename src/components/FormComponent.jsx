"use client";

import { useState, useEffect } from "react";
import ToastAlert from "./ToastAlert";
import { useOrderForm } from "@/hooks/useOrderForm";
import { container } from "@infrastructure/di/DIContainer";

export default function FormComponent() {
  const { data, loading, error, success, updateField, submitOrder, reset } = useOrderForm();
  const [toast, setToast] = useState({ visible: false, type: "success", message: "" });
  
  const handleCloseToast = () => setToast((prev) => ({ ...prev, visible: false }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateField(name, type === "checkbox" ? checked : value);
  };

  useEffect(() => {
    if (error) {
      setToast({ visible: true, type: "error", message: error });
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // El hook maneja el state y error. Intentamos enviar al backend
    try {
      const result = await submitOrder();
      
      // Si la API respondió con éxito, el servidor hizo el trabajo de BD y Sheets.
      // Ahora solo abrimos el enlace de WhatsApp (esto sigue en frontend porque 
      // requiere abrir la app de WA del usuario).
      
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;
      const msg = `¡Hola! Nuevo pedido 📦\n\n*Cliente:* ${result.order.customerName}\n*Tel:* ${result.order.customerPhone}\n\n*Pedido:*\n${result.order.details}`;
      const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");

      setToast({ 
        visible: true, 
        type: "success", 
        message: "¡Pedido registrado y enviado!" 
      });
      
    } catch (err) {
      // El error se muestra via useEffect
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="form-container">
        
        <div className="input-group">
          <label htmlFor="nombre" className="input-label">Nombre Completo</label>
          <input 
            type="text" 
            id="nombre" 
            name="nombre" 
            className="glass-input" 
            placeholder="Ej. Juan Pérez"
            value={data.nombre}
            onChange={handleChange}
            autoComplete="name"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="telefono" className="input-label">Tu Teléfono (10 dígitos)</label>
          <input 
            type="tel" 
            id="telefono" 
            name="telefono" 
            className="glass-input" 
            placeholder="Ej. 5512345678"
            value={data.telefono}
            onChange={handleChange}
            maxLength={10}
            autoComplete="tel"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="pedido" className="input-label">Detalle del Pedido</label>
          <textarea 
            id="pedido" 
            name="pedido" 
            className="glass-input input-textarea" 
            placeholder="Describe los productos que necesitas..."
            value={data.pedido}
            onChange={handleChange}
            rows={4}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="totalCop" className="input-label">Total Estimado (COP - Opcional)</label>
          <input 
            type="number" 
            id="totalCop" 
            name="totalCop" 
            className="glass-input" 
            placeholder="Ej. 15000"
            value={formData.totalCop}
            onChange={handleChange}
            min="0"
          />
        </div>
        
        <div className="input-group">
          <label className="flex items-start gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              name="consentimiento"
              checked={data.consentimiento}
              onChange={handleChange}
              className="mt-1 shrink-0"
            />
            <span>
              Autorizo el tratamiento de mis datos personales conforme a la{" "}
              <a
                href="/politica-de-datos"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Política de Tratamiento de Datos
              </a>{" "}
              (Ley 1581 de 2012).
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="glow-button mt-4"
        >
          {loading ? "Procesando..." : "Enviar Pedido por WhatsApp"}
        </button>
      </form>
      
      <ToastAlert 
        type={toast.type} 
        message={toast.message} 
        visible={toast.visible} 
        onClose={handleCloseToast} 
      />
    </>
  );
}
