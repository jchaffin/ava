import ProductsClient from './ProductsClient';
import { IProduct } from '@/types';
import connectDB from '@/lib/mongoose';
import { Product } from '@/models';

async function fetchInitialProducts() {
  try {
    await connectDB();
    
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
      .exec();
    
    // Convert MongoDB documents to plain objects for Client Components
    const serializedProducts = products.map((product: any) => ({
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
    
    console.log('Fetch success, products:', serializedProducts.length);
    return serializedProducts as IProduct[];
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
