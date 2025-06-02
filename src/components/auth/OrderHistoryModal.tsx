'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrdersRTDB } from '@/lib/firebase';
import { createPortal } from 'react-dom';

interface OrderStatus {
  code: string;
  text: string;
  color: string;
}

interface OrderStatusData {
  title: string;
  statuses: OrderStatus[];
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [totalAmount, setTotalAmount] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);

  // Set mounted state to true on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Load order statuses from shop_info.json
  useEffect(() => {
    const fetchOrderStatuses = async () => {
      try {
        const response = await fetch('/assets/data/shop_info.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.orderStatus && Array.isArray(data.orderStatus.statuses)) {
          setOrderStatuses(data.orderStatus.statuses);
        }
      } catch (err: any) {
        console.error('Error fetching order statuses:', err);
      }
    };

    fetchOrderStatuses();
  }, []);

  // Load order history when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchOrderHistory();
    }
  }, [isOpen, currentUser]);

  // Filter orders by selected month
  useEffect(() => {
    if (orders.length > 0) {
      let filtered = [...orders];

      if (selectedMonth !== 'all') {
        filtered = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const orderMonth = orderDate.getMonth() + 1; // JavaScript months are 0-indexed
          const orderYear = orderDate.getFullYear();
          return `${orderYear}-${orderMonth.toString().padStart(2, '0')}` === selectedMonth;
        });
      }

      setFilteredOrders(filtered);

      // Calculate total amount
      const total = filtered.reduce((sum, order) => {
        return sum + (order.totalAmount || order.total || 0);
      }, 0);

      setTotalAmount(total);
    }
  }, [orders, selectedMonth]);

  const fetchOrderHistory = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError('');

    try {
      const orderHistory = await getUserOrdersRTDB(currentUser.uid);
      setOrders(orderHistory);
      setFilteredOrders(orderHistory);

      // Calculate initial total amount
      const total = orderHistory.reduce((sum, order) => {
        return sum + (order.totalAmount || order.total || 0);
      }, 0);

      setTotalAmount(total);
    } catch (error: any) {
      console.error('Error fetching order history:', error);
      setError('Không thể tải lịch sử đơn hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate list of months from orders
  const getAvailableMonths = () => {
    if (!orders.length) return [];

    const months = new Set<string>();

    orders.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const year = date.getFullYear();
        months.add(`${year}-${month.toString().padStart(2, '0')}`);
      }
    });

    return Array.from(months).sort().reverse(); // Sort in descending order (newest first)
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusColor = (status: string) => {
    // Find the status in orderStatuses
    const statusObj = orderStatuses.find(s => s.code === status);

    if (statusObj) {
      // Return color based on the color property
      switch (statusObj.color) {
        case 'yellow':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'blue':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'purple':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        case 'green':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'red':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      }
    }

    // Fallback to default colors if status not found
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    // Find the status in orderStatuses
    const statusObj = orderStatuses.find(s => s.code === status);

    // Return the text if found
    if (statusObj) {
      return statusObj.text;
    }

    // Fallback to hardcoded values if status not found
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Don't render anything on server side or if modal is closed
  if (!mounted || !isOpen) return null;

  // Use createPortal to render modal outside of the component hierarchy
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-6 relative max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl" style={{ width: '95%', maxWidth: '1400px' }}>
        <div className="mb-6 sticky top-0 bg-white dark:bg-gray-800 z-10 py-2 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lịch sử đơn hàng</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md dark:bg-red-900/30 dark:text-red-400 flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {orders.length > 0 ? (
                <>
                  <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center">
                      <span className="text-gray-700 dark:text-gray-300 mr-2">Lọc theo tháng:</span>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="all">Tất cả</option>
                        {getAvailableMonths().map(month => (
                          <option key={month} value={month}>
                            {month.split('-')[1]}/{month.split('-')[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
                      <span className="text-gray-700 dark:text-gray-300">Tổng chi tiêu:</span>
                      <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {filteredOrders.length > 0 ? (
                      <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[8%]">
                              Mã đơn hàng
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">
                              Ngày đặt
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[20%]">
                              Sản phẩm
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">
                              Tổng tiền
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[8%]">
                              Trạng thái
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[12%]">
                              Người nhận
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">
                              Địa chỉ
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[9%]">
                              Vận chuyển
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[8%]">
                              Thanh toán
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-3 py-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]" title={order.id}>
                                  {order.id}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {order.product ? (
                                    <div className="flex items-center">
                                      {order.product.image && (
                                        <img
                                          src={order.product.image}
                                          alt={order.product.name}
                                          className="w-8 h-8 object-cover rounded-md mr-2 flex-shrink-0"
                                        />
                                      )}
                                      <span className="truncate">{order.product.name}</span>
                                    </div>
                                  ) : order.items && order.items.length > 0 ? (
                                    <div>
                                      {order.items.slice(0, 2).map((item: any, index: number) => (
                                        <div key={index} className="flex items-center mb-1 last:mb-0">
                                          {item.image && (
                                            <img
                                              src={item.image}
                                              alt={item.name}
                                              className="w-8 h-8 object-cover rounded-md mr-2 flex-shrink-0"
                                            />
                                          )}
                                          <span className="truncate">{item.name}</span>
                                        </div>
                                      ))}
                                      {order.items.length > 2 && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          +{order.items.length - 2} sản phẩm khác
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 dark:text-gray-400">Không có thông tin</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                  {formatPrice(order.totalAmount || order.total || 0)}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  <div>{order.customerInfo?.name || 'N/A'}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    SĐT: {order.customerInfo?.phone || 'N/A'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="text-sm text-gray-700 dark:text-gray-300 truncate" title={order.customerInfo?.address}>
                                  {order.customerInfo?.address || 'N/A'}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  {order.shippingMethod === 'standard' ? 'Tiêu chuẩn' : order.shippingMethod || 'N/A'}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  {order.paymentMethod === 'COD' ? 'COD' : order.paymentMethod || 'N/A'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Không có đơn hàng nào trong khoảng thời gian đã chọn
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Bạn chưa có đơn hàng nào
                </div>
              )}
            </>
          )}
      </div>
    </div>,
    document.body
  );
}
