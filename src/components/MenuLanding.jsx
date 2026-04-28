"use client";

import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useDomis } from "../hooks/useDomis";
import MenuHeader from "./MenuHeader";
import CategoryList from "./CategoryList";
import ProductGrid from "./ProductGrid";
import CartSection from "./CartSection";

export default function MenuLanding() {
  const { products, categories, loading: productsLoading } = useProducts();
  const { domis, loading: domisLoading } = useDomis();

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

  if (productsLoading || domisLoading) {
    return (
      <div className="main-layout flex-col items-center justify-center">
        <div className="text-glow-cyan text-xl">Cargando menú...</div>
      </div>
    );
  }

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

  const handleCheckout = async () => {
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
    if (!APPS_SCRIPT_URL) {
      alert("Error: NEXT_PUBLIC_APPS_SCRIPT_URL no configurado.");
      return;
    }

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

      console.log("✅ Pedido enviado a Sheets");

      const msg = `¡Hola! Nuevo pedido 📦\n\n*Cliente:* ${nombre}\n*Tel:* ${telefono}\n*Dirección:* ${direccion} (${selectedBarrio})\n\n*Pedido:*\n${pedidoText}\n\n*Total:* $${total.toLocaleString()}`;
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || "573000000000";
      const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");

      setCart([]);
      setIsCartOpen(false);
      setNombre("");
      setTelefono("");
      setDireccion("");
      setSelectedBarrio("");
      setAcceptedPolicy(false);

      alert("¡Pedido registrado y enviado por WhatsApp!");
      
    } catch (err) {
      console.error("❌ Error al enviar a Sheets:", err);
      alert("Error al registrar el pedido. Intenta de nuevo.");
    }
  };

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
      />
    </div>
  );
}
