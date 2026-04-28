"use client";

import { useState, useCallback, useRef } from "react";
import MenuHeader from "./MenuHeader";
import CategoryList from "./CategoryList";
import ProductGrid from "./ProductGrid";
import CartSection from "./CartSection";

export default function MenuLanding({ initialProducts = [], initialCategories = [], initialDomis = [] }) {
  const products = initialProducts;
  const categories = initialCategories;
  const domisData = initialDomis;

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Entradas");
  
  // Opciones de envío
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [selectedBarrio, setSelectedBarrio] = useState("");
  const [domicilio, setDomicilio] = useState(0);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);


  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter((product) => product.category === selectedCategory);

  const addToCart = (product, size) => {
    let price = product.price;
    let name = product.name;
    let imageStr = product.image;
    
    if (size && typeof product.price === "object") {
      price = product.price[size];
      name = `${product.name} (${size})`;
      if (product.images) imageStr = product.images[size];
    }
    if (!imageStr && product.images) imageStr = Object.values(product.images)[0];
    if (!imageStr) imageStr = "placeholder.jpg";

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && (!size || item.name === name)
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.name === name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, name, price, quantity: 1, cartImage: imageStr }];
      }
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (cart.length > 0 ? domicilio : 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = useCallback(async () => {
    if (isSubmitting || cooldown > 0) return;
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }
    if (!nombre || !telefono || !direccion || !selectedBarrio) {
      alert("Por favor completa todos los datos de envío obligatorios.");
      return;
    }
    if (!acceptedPolicy) {
      alert("Debes autorizar el tratamiento de datos para continuar.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(telefono.trim())) {
      alert("El teléfono debe tener exactamente 10 dígitos numéricos.");
      return;
    }

    let pedidoText = "Pedidos:\n";
    cart.forEach((item) => {
      pedidoText += `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString()})\n`;
    });
    pedidoText += `\nEnvío: ${selectedBarrio}\nDirección: ${direccion}\nDomicilio: $${domicilio.toLocaleString()}`;

    const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || "573000000000";

    // Abrir la ventana ANTES del await para que el navegador no la bloquee
    // (los browsers bloquean window.open si se llama después de un await)
    const waWindow = window.open("", "_blank");

    setIsSubmitting(true);

    // 1. Enviar a Google Sheets (obligatorio — se intenta siempre)
    let sheetsSent = false;
    if (APPS_SCRIPT_URL) {
      try {
        const payload = {
          sheet: "Pedidos",
          data: {
            Cliente: nombre,
            Telefono: telefono,
            Pedido: pedidoText,
            Fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
            Estado: "PENDIENTE",
            TotalCOP: total
          }
        };
        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
          mode: "no-cors"
        });
        sheetsSent = true;
        console.log("✅ Pedido enviado a Sheets");
      } catch (sheetsErr) {
        console.error("❌ Error al enviar a Sheets:", sheetsErr);
      }
    } else {
      console.warn("⚠️ NEXT_PUBLIC_APPS_SCRIPT_URL no está configurado en .env.local");
    }

    // 2. Asignar la URL a la ventana ya abierta — WhatsApp siempre llega
    try {
      const msg = `¡Hola! Nuevo pedido 📦\n\n*Cliente:* ${nombre}\n*Tel:* ${telefono}\n*Dirección:* ${direccion} (${selectedBarrio})\n\n*Pedido:*\n${pedidoText}\n\n*Total:* $${total.toLocaleString("es-CO")}${!sheetsSent ? "\n\n⚠️ No se pudo registrar en la base de datos." : ""}`;
      const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
      
      if (waWindow) {
        waWindow.location.href = waUrl;
      } else {
        // Fallback si el navegador bloqueó incluso la apertura inicial
        window.location.href = waUrl;
      }

      setCart([]);
      setIsCartOpen(false);
      setNombre("");
      setTelefono("");
      setDireccion("");
      setSelectedBarrio("");
      setAcceptedPolicy(false);
    } catch (waErr) {
      console.error("❌ Error al abrir WhatsApp:", waErr);
      alert("El pedido se procesó pero no se pudo abrir WhatsApp. Contacta al restaurante manualmente.");
    } finally {
      setIsSubmitting(false);
      // Cooldown de 5 segundos para evitar pedidos duplicados
      let secs = 5;
      setCooldown(secs);
      cooldownRef.current = setInterval(() => {
        secs -= 1;
        setCooldown(secs);
        if (secs <= 0) clearInterval(cooldownRef.current);
      }, 1000);
    }
  }, [isSubmitting, cooldown, cart, nombre, telefono, direccion, selectedBarrio, acceptedPolicy, domicilio, total]);

  return (
    <div className="app-layout">
      <style dangerouslySetInnerHTML={{__html: `
        .app-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
          color: #fff;
          font-family: sans-serif;
          background: rgba(10, 10, 15, 0.4);
          backdrop-filter: blur(10px);
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding-bottom: 2rem;
          width: 100%;
        }
      `}} />
      
      <div className="main-content">
        <MenuHeader totalItems={totalItems} onOpenCart={() => setIsCartOpen(true)} />
        <CategoryList 
          categories={categories} 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
        />
        <ProductGrid 
          products={filteredProducts} 
          addToCart={(prod, size) => addToCart(prod, size)} 
        />
      </div>

      {/* OVERLAY DEL CARRITO */}
      <div 
        onClick={() => setIsCartOpen(false)}
        style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          opacity: isCartOpen ? 1 : 0, pointerEvents: isCartOpen ? "auto" : "none",
          transition: "opacity 0.3s ease", zIndex: 9998
        }}
      />

      <CartSection 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        totalItems={totalItems}
        subtotal={subtotal}
        total={total}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        nombre={nombre} setNombre={setNombre}
        telefono={telefono} setTelefono={setTelefono}
        direccion={direccion} setDireccion={setDireccion}
        selectedBarrio={selectedBarrio} setSelectedBarrio={setSelectedBarrio}
        acceptedPolicy={acceptedPolicy} setAcceptedPolicy={setAcceptedPolicy}
        handleCheckout={handleCheckout}
        isSubmitting={isSubmitting}
        cooldown={cooldown}
      />
    </div>
  );
}
