export default function MenuHeader({ totalItems, onOpenCart }) {
  return (
    <div style={{ 
      display: "flex", justifyContent: "space-between", alignItems: "center", 
      padding: "1.5rem 1.5rem", position: "sticky", top: 0, zIndex: 100,
      background: "linear-gradient(to bottom, rgba(10,12,18,0.95) 0%, rgba(10,12,18,0) 100%)"
    }}>
      {/* Top left corner empty */}
      <div style={{ width: "40px" }}></div>
      
      {/* Central circular restaurant logo */}
      <div style={{ 
        width: "70px", height: "70px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", 
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem",
        background: "rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)"
      }}>
        🍽️
      </div>

      {/* Cart button on the right */}
      <button 
        onClick={onOpenCart}
        style={{ 
          background: "none", border: "none", color: "#fff", fontSize: "1.8rem", cursor: "pointer", position: "relative",
          width: "40px", display: "flex", justifyContent: "center", alignItems: "center"
        }}
      >
        🛒
        {totalItems > 0 && (
          <span style={{ 
            position: "absolute", top: "-5px", right: "-10px", background: "#1e73e8", 
            color: "#fff", fontSize: "0.75rem", fontWeight: "bold", width: "22px", height: "22px", 
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.5)"
          }}>
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
}
