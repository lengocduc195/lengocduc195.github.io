import { getShopProducts } from '@/lib/shopUtils';
import ClientShopWrapper from './ClientShopWrapper';
import CategoryLink from './CategoryLink';

export default async function ShopPage() {
  const products = await getShopProducts();

  // Get unique categories from products
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean);

  return (
    <main className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-40 left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] bg-repeat opacity-10"></div>
        </div>

        {/* Content */}
        <div className="relative py-24 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-block mb-4 px-3 py-1 bg-indigo-500/30 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Premium Quality Products
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Discover Our <span className="text-yellow-300">Curated Collection</span>
            </h1>
            <p className="text-xl text-center max-w-3xl mx-auto text-indigo-100 mb-10">
              From specialty coffee to artisanal crafts, each product is carefully selected to bring quality and joy to your everyday life.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a href="#products" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300 shadow-lg flex items-center">
                <span>Browse Products</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
              <a href="#categories" className="px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-colors duration-300 shadow-lg">
                Explore Categories
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories Section */}
      <div id="categories" className="py-16 bg-gradient-to-b from-indigo-900 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Featured <span className="text-indigo-400">Categories</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore our diverse range of product categories, each offering unique items selected for their quality and craftsmanship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Coffee Category */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=1000&auto=format&fit=crop)` }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="relative p-6 flex flex-col h-full justify-end min-h-[200px]">
                <h3 className="text-xl font-bold text-white mb-2">Coffee</h3>
                <p className="text-gray-200 mb-4">Premium beans from the world's finest growing regions.</p>
                <CategoryLink category="Coffee">
                  <span>Explore Coffee</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </CategoryLink>
              </div>
            </div>

            {/* Handicraft Category */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1000&auto=format&fit=crop)` }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="relative p-6 flex flex-col h-full justify-end min-h-[200px]">
                <h3 className="text-xl font-bold text-white mb-2">Handicrafts</h3>
                <p className="text-gray-200 mb-4">Traditional handcrafted items made by skilled artisans.</p>
                <CategoryLink category="Handicraft">
                  <span>Explore Handicrafts</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </CategoryLink>
              </div>
            </div>

            {/* Tea Category */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=1000&auto=format&fit=crop)` }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="relative p-6 flex flex-col h-full justify-end min-h-[200px]">
                <h3 className="text-xl font-bold text-white mb-2">Tea</h3>
                <p className="text-gray-200 mb-4">Organic teas with exquisite flavors and aromas.</p>
                <CategoryLink category="Tea">
                  <span>Explore Tea</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </CategoryLink>
              </div>
            </div>

            {/* Gift Sets Category */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(https://images.unsplash.com/photo-1607344645866-009c320c5ab0?q=80&w=1000&auto=format&fit=crop)` }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="relative p-6 flex flex-col h-full justify-end min-h-[200px]">
                <h3 className="text-xl font-bold text-white mb-2">Gift Sets</h3>
                <p className="text-gray-200 mb-4">Curated gift collections for every occasion.</p>
                <CategoryLink category="Gift Sets">
                  <span>Explore Gift Sets</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </CategoryLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-indigo-600 dark:text-indigo-400">Products</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our collection of premium products, each selected for its quality, authenticity, and exceptional value.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          <ClientShopWrapper initialProducts={products} />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-100 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Our <span className="text-indigo-600 dark:text-indigo-400">Customers Say</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Don't just take our word for it - hear what our satisfied customers have to say about our products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Sarah Johnson</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">"The Ethiopian coffee beans are exceptional! The flavor profile is exactly as described - fruity with a hint of chocolate. Will definitely be ordering more."</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Michael Chen</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">"The bamboo basket is not only beautiful but incredibly well-made. The craftsmanship is evident in every detail. It's now a centerpiece in my living room."</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Aisha Patel</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(4)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">"I purchased the gift set for my mother's birthday and she absolutely loved it! The presentation was beautiful and the quality of each item was outstanding."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-indigo-600 dark:bg-indigo-900 py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-indigo-100 mb-8">Subscribe to our newsletter to receive updates on new products, special offers, and exclusive discounts.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 flex-grow max-w-md"
            />
            <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium px-6 py-3 rounded-lg transition-colors duration-300 shadow-md">
              Subscribe
            </button>
          </div>
          <p className="text-indigo-200 text-sm mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </main>
  );
}
