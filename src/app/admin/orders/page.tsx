'use client';

import { useState, useEffect } from 'react';
import { rtdb } from '@/lib/firebase';
import { ref, get, query, orderByChild, update } from 'firebase/database';
import { withAdminProtection } from '@/contexts/AdminContext';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note: string;
}

interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  customerInfo: CustomerInfo;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  orderDate: string;
  statusHistory: StatusHistoryEntry[];
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: 'bg-yellow-500' },
    { value: 'processing', label: 'Đang xử lý', color: 'bg-blue-500' },
    { value: 'shipped', label: 'Đã gửi hàng', color: 'bg-purple-500' },
    { value: 'delivered', label: 'Đã giao hàng', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-500' },
    { value: 'refunded', label: 'Đã hoàn tiền', color: 'bg-gray-500' },
  ];

  // Fetch orders from Firebase Realtime Database
  useEffect(() => {
    const fetchOrders = async () => {
      if (!rtdb) {
        setError('Firebase Realtime Database is not initialized');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ordersRef = ref(rtdb, 'orders');
        const ordersQuery = query(ordersRef, orderByChild('createdAt'));
        const snapshot = await get(ordersQuery);

        if (snapshot.exists()) {
          const ordersData: Order[] = [];
          snapshot.forEach((childSnapshot) => {
            const orderData = childSnapshot.val();
            ordersData.push({
              ...orderData,
              orderId: orderData.orderId || childSnapshot.key,
            });
          });

          // Sort orders by createdAt (newest first)
          ordersData.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          setOrders(ordersData);
        } else {
          setOrders([]);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on status and search term
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      searchTerm === '' || 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Open order details modal
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setNewStatus(order.status);
    setStatusNote('');
  };

  // Close order details modal
  const closeOrderDetails = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Update order status
  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdateLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const orderRef = ref(rtdb, `orders/${selectedOrder.orderId}`);
      
      // Create status history entry
      const statusEntry = {
        status: newStatus,
        timestamp: timestamp,
        note: statusNote || `Trạng thái đơn hàng thay đổi thành ${newStatus}`
      };

      // Get current status history or initialize empty array
      const statusHistory = selectedOrder.statusHistory || [];
      
      // Update order
      await update(orderRef, {
        status: newStatus,
        updatedAt: timestamp,
        statusHistory: [...statusHistory, statusEntry]
      });

      // Update local state
      setOrders(orders.map(order => 
        order.orderId === selectedOrder.orderId 
          ? { 
              ...order, 
              status: newStatus, 
              updatedAt: timestamp,
              statusHistory: [...(order.statusHistory || []), statusEntry]
            } 
          : order
      ));

      // Update selected order
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        updatedAt: timestamp,
        statusHistory: [...(selectedOrder.statusHistory || []), statusEntry]
      });

      setUpdateLoading(false);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
      setUpdateLoading(false);
    }
  };

  // Get status label and color
  const getStatusInfo = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption || { value: status, label: status, color: 'bg-gray-500' };
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-16">
        <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-center">Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 pt-16">
        <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
        <div className="bg-red-900 rounded-lg p-6 shadow-lg">
          <p className="text-center">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-16">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
      
      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 text-white rounded px-3 py-2"
            >
              <option value="all">Tất cả</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Tìm kiếm:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn hàng, tên khách hàng, email, số điện thoại..."
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          </div>
        </div>
      </div>
      
      {/* Orders table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mã đơn hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ngày đặt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>{order.customerInfo.name}</div>
                      <div className="text-gray-400">{order.customerInfo.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(order.status).color}`}>
                        {getStatusInfo(order.status).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order details modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.orderId}</h2>
                <button
                  onClick={closeOrderDetails}
                  className="text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Thông tin khách hàng</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p><span className="font-medium">Tên:</span> {selectedOrder.customerInfo.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customerInfo.email}</p>
                    <p><span className="font-medium">Điện thoại:</span> {selectedOrder.customerInfo.phone}</p>
                    <p><span className="font-medium">Địa chỉ:</span> {selectedOrder.customerInfo.address}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p><span className="font-medium">Ngày đặt:</span> {formatDate(selectedOrder.createdAt)}</p>
                    <p><span className="font-medium">Phương thức thanh toán:</span> {selectedOrder.paymentMethod}</p>
                    <p><span className="font-medium">Phương thức vận chuyển:</span> {selectedOrder.shippingMethod}</p>
                    <p>
                      <span className="font-medium">Trạng thái:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusInfo(selectedOrder.status).color}`}>
                        {getStatusInfo(selectedOrder.status).label}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
              <div className="bg-gray-700 rounded-lg overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sản phẩm</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Giá</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Số lượng</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-800">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-medium">Tạm tính:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(selectedOrder.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-medium">Phí vận chuyển:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(selectedOrder.shippingCost)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-medium">Tổng cộng:</td>
                      <td className="px-4 py-2 text-right font-bold">{formatCurrency(selectedOrder.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Cập nhật trạng thái</h3>
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái mới:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-gray-600 text-white rounded px-3 py-2"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Ghi chú:</label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Ghi chú về việc thay đổi trạng thái"
                      className="w-full bg-gray-600 text-white rounded px-3 py-2"
                    />
                  </div>
                </div>
                <button
                  onClick={updateOrderStatus}
                  disabled={updateLoading || selectedOrder.status === newStatus}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </button>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Lịch sử trạng thái</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                  <ul className="space-y-2">
                    {[...selectedOrder.statusHistory].reverse().map((entry, index) => (
                      <li key={index} className="border-b border-gray-600 pb-2 last:border-0">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(entry.status).color} mr-2`}>
                            {getStatusInfo(entry.status).label}
                          </span>
                          <span className="text-gray-400 text-sm">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm mt-1">{entry.note}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Không có lịch sử trạng thái</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminProtection(AdminOrdersPage);
