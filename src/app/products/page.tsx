import ProductsClient from './ProductsClient';
import { IProduct } from '@/types';

async function fetchInitialProducts() {
  try {
    const res = await fetch('/api/products', { 
      cache: 'no-store'
    });
    
    console.log('Fetch status:', res.status);
    
    if (!res.ok) {
      console.log('Fetch failed:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    console.log('Fetch success, products:', data.data?.products?.length || 0);
    return data.data?.products || [];
  } catch (error) {
    console.log('Fetch error:', error);
    return [];
  }
}

const ProductsPage = async () => {
  const initialProducts: IProduct[] = await fetchInitialProducts();
  console.log('Page products:', initialProducts.length);
  return <ProductsClient initialProducts={initialProducts} />;
};

export default ProductsPage;
