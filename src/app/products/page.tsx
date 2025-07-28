import ProductsClient from './ProductsClient';
import { IProduct } from '@/types';
import { API } from '@/utils/constants';

async function fetchInitialProducts() {
  // Use absolute URL for SSR fetch to avoid URL parsing issues
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL || 'http://localhost:3000';
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
