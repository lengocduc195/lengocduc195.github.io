'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShopProduct } from '@/lib/shopUtils';

interface ShopProductListProps {
  initialProducts: ShopProduct[];
}

export default function ShopProductList({ initialProducts }: ShopProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortCriteria, setSortCriteria] = useState<'price_asc' | 'price_desc' | 'name_asc' | 'newest'>('newest');

  // Lấy tất cả các danh mục từ sản phẩm
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    categorySet.add('all');

    initialProducts.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });

    return Array.from(categorySet);
  }, [initialProducts]);

  // Cập nhật URL khi thay đổi danh mục
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      router.push(`/shop?category=${selectedCategory}`, { scroll: false });
    } else {
      router.push('/shop', { scroll: false });
    }
  }, [selectedCategory, router]);

  // Xử lý tham số URL category khi trang được tải
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // Tìm danh mục phù hợp (không phân biệt chữ hoa/thường)
      const matchedCategory = categories.find(
        cat => cat.toLowerCase() === categoryParam.toLowerCase()
      );

      if (matchedCategory) {
        setSelectedCategory(matchedCategory);
      }
    }
  }, [searchParams, categories]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(initialProducts)) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    let filtered = initialProducts.filter(product => {
      // Lọc theo từ khóa tìm kiếm
      const nameMatch = product.name.toLowerCase().includes(lowerSearchTerm);
      const descMatch = product.description.toLowerCase().includes(lowerSearchTerm);

      // Lọc theo danh mục
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;

      return (nameMatch || descMatch) && categoryMatch;
    });

    // Sắp xếp sản phẩm
    switch (sortCriteria) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    return filtered;
  }, [initialProducts, searchTerm, sortCriteria, selectedCategory]);

  // Hàm xử lý chuyển hướng đến trang chi tiết sản phẩm
  const handleProductClick = (slug: string) => {
    router.push(`/shop/${slug}`);
  };

  // Hàm định dạng giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Hàm lấy màu nền cho danh mục
  const getCategoryColor = (category: string) => {
    const colorMap: {[key: string]: string} = {
      'coffee': 'bg-amber-500',
      'tea': 'bg-green-500',
      'honey': 'bg-yellow-500',
      'spices': 'bg-red-500',
      'handicraft': 'bg-purple-500',
      'accessories': 'bg-blue-500',
      'gift-sets': 'bg-pink-500'
    };

    return colorMap[category.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <div>
      {/* Category Pills */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              data-category={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'Tất cả sản phẩm' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="newest">Mới nhất</option>
            <option value="name_asc">Tên (A-Z)</option>
            <option value="price_asc">Giá: Thấp đến cao</option>
            <option value="price_desc">Giá: Cao đến thấp</option>
          </select>
        </div>
      </div>

      {initialProducts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-indigo-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Hiện tại chưa có sản phẩm nào trong hệ thống. Vui lòng quay lại sau.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Hiển thị {filteredAndSortedProducts.length} sản phẩm
            {searchTerm && <span> phù hợp với "{searchTerm}"</span>}
            {selectedCategory !== 'all' && <span> trong danh mục "{selectedCategory}"</span>}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => handleProductClick(product.slug)}
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${product.image})` }}
                  />

                  {/* Category Badge */}
                  <div className={`absolute top-3 left-3 ${getCategoryColor(product.category)} text-white text-xs font-bold px-2 py-1 rounded-md`}>
                    {product.category}
                  </div>

                  {/* Sale Badge */}
                  {product.salePrice && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      Giảm {Math.round((1 - product.salePrice / product.price) * 100)}%
                    </div>
                  )}
                </div>

                {/* Product Content */}
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 flex-grow">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="mt-4 flex items-center">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Footer */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
