'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/dataUtils';

interface ProductListProps {
  initialProducts: Product[];
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState<'date_desc' | 'date_asc' | 'name_asc'>('date_desc');

  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(initialProducts)) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    let filtered = initialProducts.filter(product => {
      const nameMatch = typeof product.name === 'string' && product.name.toLowerCase().includes(lowerSearchTerm);
      const descMatch = typeof product.description === 'string' && product.description.toLowerCase().includes(lowerSearchTerm);
      // Ưu tiên lọc theo 'tags', sau đó mới đến 'technologies'
      const tags = product.tags ?? product.technologies;
      const tagMatch = Array.isArray(tags) && tags.some(
        tag => typeof tag === 'string' && tag.toLowerCase().includes(lowerSearchTerm)
      );
      return nameMatch || descMatch || tagMatch;
    });

    switch (sortCriteria) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        break;
      case 'date_desc':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    return filtered;
  }, [initialProducts, searchTerm, sortCriteria]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products by name, description, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          </div>
          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value as typeof sortCriteria)}
            className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-sm"
          >
            <option value="date_desc">Sort by Date (Newest)</option>
            <option value="date_asc">Sort by Date (Oldest)</option>
            <option value="name_asc">Sort by Name (A-Z)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 17v.01" />
          </svg>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No products match your criteria</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Showing {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''}
            {searchTerm && <span> matching "{searchTerm}"</span>}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map((product) => {
              const displayTags = product.tags ?? product.technologies;
              const productLink = product.url ?? product.link ?? product.demoUrl;

              // Tạo slug từ name hoặc id
              let slug: string | null = null;
              if (typeof product.name === 'string' && product.name.trim() !== '') {
                slug = product.name.toLowerCase().replace(/\s+/g, '-');
              } else if (product.id !== null && product.id !== undefined) {
                slug = product.id.toString();
              }
              const productDetailUrl = slug ? `/products/${slug}` : null;
              const itemKey = product.id?.toString() ?? slug ?? `product-fallback-${Math.random()}`;

              return (
                <div key={itemKey} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transform hover:-translate-y-1">
                  {/* Product Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 relative">
                    <div className="absolute top-0 right-0 mt-4 mr-4">
                      {product.date && (
                        <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          {new Date(product.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-white">
                      {/* Liên kết đến trang chi tiết nội bộ */}
                      {productDetailUrl ? (
                        <Link href={productDetailUrl} className="hover:text-white/90 transition-colors">
                          {product.name ?? 'Unnamed Product'}
                        </Link>
                      ) : (
                        <span>{product.name ?? 'Unnamed Product'}</span>
                      )}
                    </h2>
                    {/* Hiển thị tags */}
                    {Array.isArray(displayTags) && displayTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {displayTags.slice(0, 3).map((tag) => (
                          typeof tag === 'string' && (
                            <span
                              key={tag}
                              className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full hover:bg-white/30 transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setSearchTerm(tag);
                              }}
                            >
                              {tag}
                            </span>
                          )
                        ))}
                        {displayTags.length > 3 && (
                          <span className="bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            +{displayTags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Product Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-3">
                      {product.description ?? 'No description available.'}
                    </p>

                    {/* Product Links */}
                    <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
                      {/* Nút Details đến trang chi tiết nội bộ */}
                      {productDetailUrl ? (
                        <Link
                          href={productDetailUrl}
                          className="inline-flex items-center text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
                        >
                          View Details
                          <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 text-sm italic">Details unavailable</span>
                      )}

                      {/* Link đến sản phẩm/demo bên ngoài (nếu có) */}
                      {productLink && (
                        <a
                          href={productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-full hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Visit Product
                          <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}