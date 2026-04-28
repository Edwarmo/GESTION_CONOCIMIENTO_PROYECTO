export default function CartSection({ 
  isOpen,
  onClose,
  cart, 
  totalItems, 
  total, 
  removeFromCart, 
  updateQuantity, 
  nombre, setNombre, 
  telefono, setTelefono, 
  direccion, setDireccion, 
  selectedBarrio, setSelectedBarrio, 
  acceptedPolicy, setAcceptedPolicy,
  handleCheckout,
  isSubmitting = false,
  cooldown = 0
}) {
  return (
    <div className="cart-drawer" style={{ 
      display: "flex", flexDirection: "column", height: "100vh",
      position: "fixed", top: 0, right: isOpen ? 0 : "-100%", width: "100%", maxWidth: "450px",
      background: "rgba(20, 20, 20, 0.85)", borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "-10px 0 40px rgba(0,0,0,0.7)", transition: "right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      zIndex: 9999,
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)"
    }}>
      {/* Header Fijo del Carrito */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ margin: 0, fontSize: "1.6rem", color: "#fff", fontWeight: "bold", letterSpacing: "-0.02em" }}>Tu Pedido</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ✕
        </button>
      </div>

      {cart.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 0.5 }}>
          <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</span>
          <p style={{ fontSize: "1.1rem", color: "#fff" }}>Tu carrito está vacío</p>
        </div>
      ) : (
        <>
          {/* Zona Scrolleable Principal (Items + Formulario) */}
          <div className="cart-items-scroll" style={{ flex: 1, overflowY: "scroll", padding: "1rem 1.5rem", display: "flex", flexDirection: "column" }}>
            <style dangerouslySetInnerHTML={{__html: `
              .cart-items-scroll::-webkit-scrollbar { width: 6px; display: block; }
              .cart-items-scroll::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
              .cart-items-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
              .cart-items-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
            `}} />
            
            {/* Lista de Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "0.8rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <img 
                    src={item.cartImage.startsWith("http") ? item.cartImage : `https://raw.githubusercontent.com/jhonedwar12/imagenes/main/${item.cartImage}`} 
                    alt={item.name} 
                    style={{ width: "65px", height: "65px", objectFit: "cover", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", backgroundColor: "#1e232d" }} 
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"; e.currentTarget.onerror = null; }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: "600", fontSize: "0.95rem", color: "#fff", lineHeight: "1.2", flex: 1, paddingRight: "0.5rem" }}>{item.name}</div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "1rem", padding: 0, transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.8)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>✕</button>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(0,0,0,0.3)", borderRadius: "20px", padding: "0.2rem" }}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "1rem", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >−</button>
                        <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#fff", minWidth: "12px", textAlign: "center" }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          style={{ background: "#1e73e8", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(30,115,232,0.4)" }}
                        >+</button>
                      </div>
                      <div suppressHydrationWarning style={{ color: "#fff", fontSize: "1rem", fontWeight: "bold" }}>${(item.price * item.quantity).toLocaleString("es-CO")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "2rem 0 1.5rem 0" }}></div>

            {/* Formulario de Datos de Envío dentro del scroll (Requerido por el sistema) */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <input 
                    className="glass-input" 
                    value={nombre} 
                    onChange={e=>setNombre(e.target.value)} 
                    placeholder="Nombre completo" 
                    style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1rem", color: "#fff", outline: "none", transition: "border 0.2s" }}
                    onFocus={e=>e.currentTarget.style.borderColor="rgba(30,115,232,0.5)"}
                    onBlur={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <input 
                    className="glass-input" 
                    value={telefono} 
                    onChange={e=>setTelefono(e.target.value)} 
                    placeholder="Teléfono" 
                    style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1rem", color: "#fff", outline: "none", transition: "border 0.2s" }}
                    onFocus={e=>e.currentTarget.style.borderColor="rgba(30,115,232,0.5)"}
                    onBlur={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <input 
                    className="glass-input" 
                    value={direccion} 
                    onChange={e=>setDireccion(e.target.value)} 
                    placeholder="Dirección (Ej. Calle 123 # 45 - 67)" 
                    style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1rem", color: "#fff", outline: "none", transition: "border 0.2s" }}
                    onFocus={e=>e.currentTarget.style.borderColor="rgba(30,115,232,0.5)"}
                    onBlur={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <input 
                    className="glass-input" 
                    value={selectedBarrio} 
                    onChange={e=>setSelectedBarrio(e.target.value)} 
                    placeholder="Barrio" 
                    style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1rem", color: "#fff", outline: "none", transition: "border 0.2s" }}
                    onFocus={e=>e.currentTarget.style.borderColor="rgba(30,115,232,0.5)"}
                    onBlur={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>
            </div>
            
          </div>

          {/* Botón Fijo al Fondo (Checkout Section integrada al drawer) */}
          <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(20,20,20,0.9)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Policy Checkbox exact text */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem" }}>
              <input 
                type="checkbox" 
                checked={acceptedPolicy}
                onChange={() => setAcceptedPolicy(!acceptedPolicy)}
                style={{ 
                  appearance: "none", WebkitAppearance: "none", width: "20px", height: "20px", minWidth: "20px",
                  background: "#fff", borderRadius: "3px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  border: "none", marginTop: "2px"
                }}
              />
              {/* Checkmark custom element overlaying the checkbox */}
              {acceptedPolicy && (
                <div style={{ position: "absolute", marginLeft: "3px", marginTop: "2px", color: "#000", fontWeight: "bold", fontSize: "14px", pointerEvents: "none" }}>✓</div>
              )}
              
              <label onClick={() => setAcceptedPolicy(!acceptedPolicy)} style={{ fontSize: "0.85rem", color: "#fff", cursor: "pointer", lineHeight: "1.4" }}>
                Autorizo el tratamiento de mis datos personales conforme a la <a href="#" style={{ color: "#1e73e8", textDecoration: "underline" }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>Política de Tratamiento de Datos</a>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.9)", fontSize: "1.2rem", fontWeight: "bold" }}>
              <span>Total:</span>
              <span suppressHydrationWarning>${total.toLocaleString("es-CO")}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={isSubmitting || cooldown > 0}
              style={{ 
                width: "100%", textAlign: "center",
                fontSize: "1.1rem", padding: "1.2rem", border: "none", borderRadius: "12px", 
                fontWeight: "bold", cursor: (isSubmitting || cooldown > 0) ? "not-allowed" : "pointer",
                transition: "background 0.2s, transform 0.1s",
                background: (isSubmitting || cooldown > 0)
                  ? "rgba(100,100,100,0.5)"
                  : acceptedPolicy ? "#1e73e8" : "rgba(30, 115, 232, 0.4)",
                color: (isSubmitting || cooldown > 0) ? "rgba(255,255,255,0.4)" : acceptedPolicy ? "#fff" : "rgba(255,255,255,0.6)",
                boxShadow: acceptedPolicy && !isSubmitting && !cooldown ? "0 8px 25px rgba(30, 115, 232, 0.4)" : "none",
                letterSpacing: "0.02em"
              }}
              onMouseDown={(e) => { if(acceptedPolicy && !isSubmitting && !cooldown) e.currentTarget.style.transform = "scale(0.98)" }}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {isSubmitting
                ? "Enviando pedido..."
                : cooldown > 0
                  ? `Espera ${cooldown}s...`
                  : "Finalizar Pedido 📲"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
