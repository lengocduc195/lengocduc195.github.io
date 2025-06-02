'use client';

import { useState, useEffect } from 'react';
import { withAdminProtection } from '@/contexts/AdminContext';
import Link from 'next/link';
import { ShopProduct } from '@/lib/shopUtils';

interface LocationData {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionCode?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  organization?: string;
  connectionType?: string;
  proxy?: boolean;
  hosting?: boolean;
}

interface ProductsState {
  shopProducts: ShopProduct[];
  portfolioProducts: any[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  categoryFilter: string;
  selectedProduct: ShopProduct | null;
  isModalOpen: boolean;
  locationData: LocationData | null;
  locationLoading: boolean;
}

function AdminProductsPage() {
  const [state, setState] = useState<ProductsState>({
    shopProducts: [],
    portfolioProducts: [],
    loading: true,
    error: null,
    searchTerm: '',
    categoryFilter: 'all',
    selectedProduct: null,
    isModalOpen: false,
    locationData: null,
    locationLoading: true
  });

  // Fetch products from shop data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch shop products
        const shopResponse = await fetch('/assets/data/shop/product-1.json')
          .then(res => {
            if (!res.ok) {
              throw new Error('Failed to fetch shop products');
            }
            return res.json();
          })
          .catch(() => {
            console.warn('No shop products found or error fetching them');
            return [];
          });

        // Fetch portfolio products
        const portfolioResponse = await fetch('/assets/data/products/products_1.json')
          .then(res => {
            if (!res.ok) {
              throw new Error('Failed to fetch portfolio products');
            }
            return res.json();
          })
          .catch(() => {
            console.warn('No portfolio products found or error fetching them');
            return [];
          });

        // Update state with fetched products
        setState(prev => ({
          ...prev,
          shopProducts: Array.isArray(shopResponse) ? shopResponse : [shopResponse],
          portfolioProducts: Array.isArray(portfolioResponse) ? portfolioResponse : [portfolioResponse],
          loading: false
        }));
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setState(prev => ({
          ...prev,
          error: err.message || 'Failed to load products',
          loading: false
        }));
      }
    };

    fetchProducts();
  }, []);

  // Fetch location data from API
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('/api/geo');

        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setState(prev => ({
            ...prev,
            locationData: data.data,
            locationLoading: false
          }));
        } else {
          throw new Error(data.error || 'Failed to get location data');
        }
      } catch (err: any) {
        console.error('Error fetching location data:', err);
        setState(prev => ({
          ...prev,
          locationLoading: false
        }));
      }
    };

    fetchLocationData();
  }, []);

  // Get unique categories from products
  const categories = ['all', ...new Set(state.shopProducts.map(product => product.category))].filter(Boolean);

  // Filter products based on search term and category
  const filteredProducts = state.shopProducts.filter(product => {
    const matchesSearch =
      state.searchTerm === '' ||
      product.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(state.searchTerm.toLowerCase());

    const matchesCategory = state.categoryFilter === 'all' || product.category === state.categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  // Open product details modal
  const openProductDetails = (product: ShopProduct) => {
    setState(prev => ({
      ...prev,
      selectedProduct: product,
      isModalOpen: true
    }));
  };

  // Close product details modal
  const closeProductDetails = () => {
    setState(prev => ({
      ...prev,
      selectedProduct: null,
      isModalOpen: false
    }));
  };

  if (state.loading) {
    return (
      <div className="container mx-auto p-6 pt-16">
        <h1 className="text-2xl font-bold mb-6">Quản lý sản phẩm</h1>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-center">Đang tải dữ liệu sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mx-auto p-6 pt-16">
        <h1 className="text-2xl font-bold mb-6">Quản lý sản phẩm</h1>
        <div className="bg-red-900 rounded-lg p-6 shadow-lg">
          <p className="text-center">Lỗi: {state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-16">
      <h1 className="text-2xl font-bold mb-6">Quản lý sản phẩm</h1>

      {/* Location Info */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Thông tin vị trí người dùng</h2>
        {state.locationLoading ? (
          <p className="text-gray-400">Đang tải thông tin vị trí...</p>
        ) : state.locationData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Địa chỉ IP</h3>
              <p className="text-white">{state.locationData.ip || 'Không có thông tin'}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Vị trí</h3>
              <p className="text-white">
                {[
                  state.locationData.city,
                  state.locationData.region,
                  state.locationData.country
                ].filter(Boolean).join(', ') || 'Không có thông tin'}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Nhà cung cấp</h3>
              <p className="text-white">{state.locationData.isp || state.locationData.organization || 'Không có thông tin'}</p>
            </div>
            {state.locationData.latitude && state.locationData.longitude && (
              <div className="bg-gray-700 rounded-lg p-3 md:col-span-3">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Tọa độ</h3>
                <p className="text-white">
                  Vĩ độ: {state.locationData.latitude}, Kinh độ: {state.locationData.longitude}
                  <a
                    href={`https://www.google.com/maps?q=${state.locationData.latitude},${state.locationData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    Xem trên bản đồ
                  </a>
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">Không thể lấy thông tin vị trí</p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục:</label>
            <select
              value={state.categoryFilter}
              onChange={(e) => setState(prev => ({ ...prev, categoryFilter: e.target.value }))}
              className="bg-gray-700 text-white rounded px-3 py-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Tất cả' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Tìm kiếm:</label>
            <input
              type="text"
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Tìm theo tên sản phẩm, mô tả..."
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}>
                        {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(product.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openProductDetails(product)}
                        className="text-blue-500 hover:text-blue-400 mr-3"
                      >
                        Chi tiết
                      </button>
                      <Link href={`/shop/${product.slug}`} target="_blank" className="text-green-500 hover:text-green-400">
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product details modal */}
      {state.isModalOpen && state.selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Chi tiết sản phẩm: {state.selectedProduct.name}</h2>
                <button
                  onClick={closeProductDetails}
                  className="text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Thông tin cơ bản</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p><span className="font-medium">ID:</span> {state.selectedProduct.id}</p>
                    <p><span className="font-medium">Tên:</span> {state.selectedProduct.name}</p>
                    <p><span className="font-medium">Slug:</span> {state.selectedProduct.slug}</p>
                    <p><span className="font-medium">Danh mục:</span> {state.selectedProduct.category}</p>
                    <p><span className="font-medium">Giá:</span> {formatCurrency(state.selectedProduct.price)}</p>
                    {state.selectedProduct.salePrice && (
                      <p><span className="font-medium">Giá khuyến mãi:</span> {formatCurrency(state.selectedProduct.salePrice)}</p>
                    )}
                    <p><span className="font-medium">Trạng thái:</span> {state.selectedProduct.inStock ? 'Còn hàng' : 'Hết hàng'}</p>
                    <p><span className="font-medium">Đánh giá:</span> {state.selectedProduct.rating}/5 ({state.selectedProduct.reviews} đánh giá)</p>
                    <p><span className="font-medium">Ngày tạo:</span> {formatDate(state.selectedProduct.date)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p>{state.selectedProduct.description}</p>
                    {state.selectedProduct.longDescription && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Mô tả chi tiết:</h4>
                        <p>{state.selectedProduct.longDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Hình ảnh</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img src={state.selectedProduct.image} alt={state.selectedProduct.name} className="w-full h-full object-cover" />
                    </div>
                    {state.selectedProduct.gallery && state.selectedProduct.gallery.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img src={image} alt={`${state.selectedProduct.name} - ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeProductDetails}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
                >
                  Đóng
                </button>
                <Link
                  href={`/shop/${state.selectedProduct.slug}`}
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Xem trên trang web
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminProtection(AdminProductsPage);
