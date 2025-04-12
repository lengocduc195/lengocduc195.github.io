import { getProducts } from '@/lib/dataUtils';
import ProductList from './ProductList';

export default async function ProductsPage() {
  const initialProducts = await getProducts();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            My <span className="text-yellow-300">Products</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-purple-100">
            Discover innovative solutions and tools I've developed to solve real-world problems.
            Each product represents my commitment to quality and user experience.
          </p>
        </div>
      </div>

      {/* Products List Section */}
      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          <ProductList initialProducts={initialProducts} />
        </div>
      </div>
    </main>
  );
}