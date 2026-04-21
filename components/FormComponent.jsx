"use client";

import { useState } from "react";
import ToastAlert from "./ToastAlert";

export default function FormComponent() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    pedido: "",
    totalCop: "",
    consentimiento: false
  });
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "success", message: "" });
  
  const handleCloseToast = () => setToast((prev) => ({ ...prev, visible: false }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validaciones
  const validate = () => {
    const { nombre, telefono, pedido } = formData;
    
    if (!nombre.trim() || !telefono.trim() || !pedido.trim()) {
      return { isValid: false, message: "Faltan datos para continuar", type: "warning" };
    }

    if (!formData.consentimiento) {
      return { isValid: false, message: "Debes aceptar la política de tratamiento de datos (Ley 1581)", type: "warning" };
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(telefono.trim())) {
      return { isValid: false, message: "El teléfono debe tener exactamente 10 dígitos numéricos", type: "warning" };
    }
    
    return { isValid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validate();
    if (!validation.isValid) {
      setToast({ visible: true, type: validation.type, message: validation.message });
      return;
    }

    setLoading(true);
    
    try {
      const { nombre, telefono, pedido, totalCop } = formData;
      const totalParsed = parseFloat(totalCop) || 0;
      
      // 1. Guardar en Google Sheets vía API route (server-side)
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, pedido, totalCop: totalParsed }),
      }).catch((err) => console.warn("Sheets sync failed (non-critical):", err));

      // 2. Armamos el mensaje elegante que vas a recibir tú en WhatsApp
      const mensaje = `¡Hola! Tienes un nuevo pedido 📦\n\n*Cliente:* ${nombre}\n*Su contacto:* ${telefono}\n\n*Detalles del pedido:*\n${pedido}\n*Valor estimado:* $${totalParsed.toLocaleString('es-CO')} COP`;

      // 3. Leemos TU teléfono (donde quieres recibir)
      const celularDestino = process.env.NEXT_PUBLIC_ADMIN_PHONE || "521234567890";

      // 4. Generamos el link Universal de WhatsApp
      const waLink = `https://wa.me/${celularDestino}?text=${encodeURIComponent(mensaje)}`;

      // 5. Abrimos WhatsApp web o la app móvil en el teléfono de TU CLIENTE
      window.open(waLink, "_blank");

      setToast({ 
        visible: true, 
        type: "success", 
        message: "¡Pedido guardado y abriendo WhatsApp!" 
      });
      
      // Limpiamos el formulario
      setFormData({ nombre: "", telefono: "", pedido: "", totalCop: "", consentimiento: false });
    } catch (error) {
      setToast({ 
        visible: true, 
        type: "error", 
        message: "Error al procesar el pedido" 
      });
    } finally {
      setTimeout(() => setLoading(false), 1500); // Pequeña pausa antes de reactivar botón
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
            value={formData.nombre}
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
            value={formData.telefono}
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
            value={formData.pedido}
            onChange={handleChange}
            rows={4}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="totalCop" className="input-label">Total Estimado en COP (Opcional)</label>
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
              checked={formData.consentimiento}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, consentimiento: e.target.checked }))
              }
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
