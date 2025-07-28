import ProductsClient from './ProductsClient';
import { IProduct } from '@/types';

async function fetchInitialProducts() {
  // Always use an absolute URL for SSR fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/products?limit=12`, { cache: 'no-store' });
  const data = await res.json();
  return data.data?.products || [];
}

const ProductsPage = async () => {
  const initialProducts: IProduct[] = await fetchInitialProducts();
  return <ProductsClient initialProducts={initialProducts} />;
};

export default ProductsPage;
