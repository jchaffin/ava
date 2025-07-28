import ProductsClient from './ProductsClient';
import { IProduct } from '@/types';

async function fetchInitialProducts() {
  // Use absolute URL that works in all environments
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
    
  const res = await fetch(`${baseUrl}/api/products?limit=12`, { 
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!res.ok) {
    console.error('Failed to fetch initial products:', res.status, res.statusText);
    return [];
  }
  
  const data = await res.json();
  return data.data?.products || [];
}

const ProductsPage = async () => {
  const initialProducts: IProduct[] = await fetchInitialProducts();
  return <ProductsClient initialProducts={initialProducts} />;
};

export default ProductsPage;
