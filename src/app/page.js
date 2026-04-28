import VideoBackground from "../components/VideoBackground";
import MenuLanding from "../components/MenuLanding";
import productsData from "../data/products.json";
import domisData from "../data/domis.json";

async function fetchProducts() {
  try {
    const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
    if (!url) return productsData;
    const res = await fetch(`${url}?action=getProducts`, { next: { revalidate: 60 } });
    if (!res.ok) return productsData;
    const data = await res.json();
    return (data && data.length > 0) ? data : productsData;
  } catch (err) {
    return productsData;
  }
}

export default async function HomePage() {
  const products = await fetchProducts();
  const domis = domisData; // Si tienes una API para domis, hazlo igual que products

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <main className="main-layout" style={{ display: 'block', padding: 0 }}>
      <VideoBackground />
      <MenuLanding 
        initialProducts={products} 
        initialCategories={categories} 
        initialDomis={domis} 
      />
    </main>
  );
}
