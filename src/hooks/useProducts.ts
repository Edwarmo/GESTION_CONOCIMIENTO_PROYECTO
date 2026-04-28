import { useState, useEffect } from 'react';
import productsData from '../data/products.json';

export interface Product {
  id: number;
  name: string;
  price: number | { [size: string]: number };
  image: string;
  images?: { [size: string]: string };
  description: string;
  category: string;
}

export interface CartProduct extends Product {
  quantity: number;
  selectedSize?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
        if (!url) throw new Error("No URL");
        
        const res = await fetch(`${url}?action=getProducts`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(productsData as any); // Fallback a local
        }
      } catch (err) {
        console.error("No se pudo cargar desde Google Sheets, usando local.", err);
        setProducts(productsData as any); // Fallback a local
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const categories = Array.from(new Set(products.map(product => product.category)));

  return {
    products,
    categories,
    loading
  };
};
