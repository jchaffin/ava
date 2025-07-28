import ProductsClient from './ProductsClient';
import { IProduct } from '@/types';

async function fetchInitialProducts() {
  try {
    const res = await fetch('/api/products?limit=12', { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.data?.products || [];
  } catch (error) {
    return [];
  }
}

const ProductsPage = async () => {
  const initialProducts: IProduct[] = await fetchInitialProducts();
  return <ProductsClient initialProducts={initialProducts} />;
};

export default ProductsPage;
