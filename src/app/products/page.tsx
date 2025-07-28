import ProductsClient from './ProductsClient';
import { IProduct } from '@/types';
import { headers } from 'next/headers';

async function fetchInitialProducts() {
  // Get the host from request headers for server-side fetch
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  const res = await fetch(`${protocol}://${host}/api/products?limit=12`, { 
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
