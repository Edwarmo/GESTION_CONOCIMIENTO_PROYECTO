export default function CategoryList({ categories, selectedCategory, setSelectedCategory }) {
  const getIconForCategory = (cat) => {
    const c = cat.toLowerCase();
    if (c.includes("entrada")) return "🥗";
    if (c.includes("plato")) return "🍲";
    if (c.includes("adicion") || c.includes("adición")) return "🍟";
    if (c.includes("arroc") || c.includes("arroz")) return "🍚";
    if (c.includes("combo")) return "🍱";
    if (c.includes("bebida")) return "🥤";
    return "🍰";
  };

  return (
    <div className="category-scroll-container" style={{ 
      display: "flex", overflowX: "auto", gap: "1rem", padding: "0.5rem 1.5rem 2rem 1.5rem",
      WebkitOverflowScrolling: "touch"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .category-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .category-scroll-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .category-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(30, 115, 232, 0.5);
          border-radius: 10px;
        }
        .category-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(30, 115, 232, 0.8);
        }
      `}} />
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          style={{
            display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.6rem",
            padding: "0.8rem", width: "160px", flexShrink: 0,
            background: selectedCategory === cat ? "#1e73e8" : "rgba(30, 35, 45, 0.6)", 
            backdropFilter: "blur(8px)",
            borderRadius: "50px", /* Pill-shaped */
            border: selectedCategory === cat ? "1px solid #1e73e8" : "1px solid rgba(255,255,255,0.1)", 
            color: "#fff", cursor: "pointer", transition: "all 0.2s",
            boxShadow: selectedCategory === cat ? "0 4px 15px rgba(30, 115, 232, 0.4)" : "0 4px 10px rgba(0,0,0,0.3)"
          }}
        >
          <span style={{ fontSize: "1.2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>{getIconForCategory(cat)}</span>
          <span style={{ fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: selectedCategory === cat ? "bold" : "500", letterSpacing: "0.02em" }}>
            {cat}
          </span>
        </button>
      ))}
    </div>
  );
}
