import ProductsClient from './ProductsClient';
import { IProduct } from '@/types';

async function fetchInitialProducts() {
  // Use relative URL for SSR fetch to avoid connection issues
  const res = await fetch('/api/products?limit=12', { 
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
