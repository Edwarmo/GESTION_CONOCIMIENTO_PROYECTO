export default function ProductGrid({ products, addToCart }) {
  return (
    <div style={{ padding: "0 1.5rem", flex: 1 }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", 
        gap: "1.5rem" 
      }}>
        {products.map((product) => {
          const hasSizes = typeof product.price === "object";
          const defaultSize = hasSizes ? Object.keys(product.price)[0] : "";
          const currentPrice = hasSizes ? product.price[defaultSize] : product.price;
          
          let imageStr = product.image;
          if (!imageStr && product.images) {
            imageStr = product.images[defaultSize] || Object.values(product.images)[0];
          }
          if (!imageStr) imageStr = "placeholder.jpg";

          return (
            <div key={product.id} style={{ 
              background: "rgba(30, 35, 45, 0.6)", backdropFilter: "blur(12px)",
              borderRadius: "16px", display: "flex", flexDirection: "column", 
              overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)", transition: "transform 0.2s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <img 
                src={imageStr.startsWith("http") ? imageStr : `https://raw.githubusercontent.com/jhonedwar12/imagenes/main/${imageStr}`} 
                alt={product.name} 
                style={{ width: "100%", height: "150px", objectFit: "cover", backgroundColor: "#1e232d" }} 
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; e.currentTarget.onerror = null; }}
              />
              <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", margin: "0 0 0.4rem 0", color: "#fff", lineHeight: "1.2" }}>{product.name}</h3>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: "1.4", flex: 1 }}>
                  {product.description.length > 60 ? product.description.substring(0, 60) + "..." : product.description}
                </p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#fff" }}>
                    ${currentPrice.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => addToCart(product, hasSizes ? defaultSize : undefined)}
                    style={{ 
                      background: "#1e73e8", border: "none", width: "85px", padding: "0.5rem 0", 
                      borderRadius: "8px", color: "#fff", fontSize: "0.8rem", 
                      fontWeight: "bold", cursor: "pointer", transition: "background 0.2s",
                      textAlign: "center"
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
