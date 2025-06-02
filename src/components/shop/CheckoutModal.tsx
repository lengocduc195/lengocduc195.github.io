'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder, sendOrderNotification, createOrderRTDB, auth, rtdb, createUserProfileRTDB, updateUserProfileRTDB } from '@/lib/firebase';
import AuthModal from '../auth/AuthModal';
import ShippingInfo from './ShippingInfo';
import { v4 as uuidv4 } from 'uuid';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  quantity: number;
}

export default function CheckoutModal({ isOpen, onClose, product, quantity }: CheckoutModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [infoAutoFilled, setInfoAutoFilled] = useState(false);
  const [infoEdited, setInfoEdited] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [updateProfile, setUpdateProfile] = useState(false);

  // Tự động điền thông tin từ userProfile khi modal mở và userProfile có sẵn
  useEffect(() => {
    if (isOpen) {
      if (userProfile) {
        console.log('Auto-filling user information from profile:', userProfile);
        setName(userProfile.name || '');
        setEmail(userProfile.email || '');
        setPhone(userProfile.phone || '');
        setAddress(userProfile.address || '');
        setInfoAutoFilled(true);
        setInfoEdited(false);
      } else if (currentUser) {
        console.log('Only email available from currentUser');
        setEmail(currentUser.email || '');
        setInfoAutoFilled(true);
        setInfoEdited(false);
      }
    }
  }, [userProfile, currentUser, isOpen]);

  // Theo dõi khi người dùng chỉnh sửa thông tin
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (infoAutoFilled) {
      setInfoEdited(true);
    }
  };

  // Khôi phục thông tin từ profile
  const restoreProfileInfo = () => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
      setInfoEdited(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if Firebase is properly available and initialized
    const isFirebaseAvailable = typeof auth !== 'undefined' && typeof rtdb !== 'undefined';
    console.log('Firebase availability check:');
    console.log('- auth available:', typeof auth !== 'undefined');
    console.log('- rtdb available:', typeof rtdb !== 'undefined');
    console.log('- Overall Firebase available:', isFirebaseAvailable);

    // If user is not logged in and Firebase is available, ask if they want to login
    if (!currentUser && isFirebaseAvailable) {
      const wantToLogin = window.confirm(
        "Bạn chưa đăng nhập. Đăng nhập sẽ giúp lưu thông tin đặt hàng và tự động điền cho lần sau. Bạn có muốn đăng nhập không?"
      );

      if (wantToLogin) {
        setIsAuthModalOpen(true);
        return;
      }
      // If they don't want to login, continue with the order as a guest
    }

    setLoading(true);
    setError('');

    try {
      // Generate a unique order ID
      const newOrderId = uuidv4().substring(0, 8).toUpperCase();
      setOrderId(newOrderId);

      // Calculate total price
      const itemPrice = product.salePrice || product.price;
      const subtotal = itemPrice * quantity;

      // Calculate shipping cost based on shipping method
      let shippingCost = 0;
      if (shippingMethod === 'express') {
        shippingCost = 30000; // 30,000 VND for express shipping
      } else if (shippingMethod === 'standard') {
        shippingCost = 15000; // 15,000 VND for standard shipping
      }

      // Calculate total with shipping
      const total = subtotal + shippingCost;

      // Create detailed order data
      const orderData = {
        orderId: newOrderId,
        items: [
          {
            id: product.id,
            name: product.name,
            price: itemPrice,
            quantity,
            subtotal: itemPrice * quantity,
            image: product.image,
          },
        ],
        subtotal,
        shippingCost,
        total,
        customerInfo: {
          name,
          email,
          phone,
          address,
        },
        paymentMethod,
        shippingMethod,
        notes,
        orderDate: new Date().toISOString(),
      };

      // Log order data for debugging
      console.log('CheckoutModal - Order data prepared:', orderData);

      console.log('Preparing to save order:', orderData);

      // Only try to save to Firebase if it's available
      if (isFirebaseAvailable) {
        console.log('Firebase is available, checking auth state...');
        console.log('Current user:', currentUser ? `Logged in (${currentUser.uid})` : 'Not logged in');
        console.log('RTDB initialized:', rtdb ? 'Yes' : 'No');

        if (currentUser) {
          console.log('Saving order for authenticated user:', currentUser.uid);

          try {
            // Create order in Realtime Database (primary storage)
            console.log('Calling createOrderRTDB with userId:', currentUser.uid);
            console.log('Order data being passed:', JSON.stringify(orderData));

            const savedOrderId = await createOrderRTDB(currentUser.uid, orderData);
            console.log('Order saved to Realtime Database with ID:', savedOrderId);

            // Also create order in Firestore for backward compatibility
            await createOrder(currentUser.uid, orderData);
            console.log('Order also saved to Firestore for compatibility');

            // Update user profile with latest order information if needed
            try {
              // Luôn cập nhật thông tin đơn hàng mới nhất
              const orderInfo = {
                lastOrderId: newOrderId,
                lastOrderDate: new Date().toISOString(),
              };

              // Chỉ cập nhật thông tin cá nhân nếu người dùng đã chọn tùy chọn này
              // hoặc nếu chưa có hồ sơ người dùng
              if (!userProfile) {
                console.log('No existing user profile, creating new profile');
                await createUserProfileRTDB(currentUser.uid, {
                  name,
                  email,
                  phone,
                  address,
                  ...orderInfo,
                });
                console.log('New user profile created with order information');
              } else if (updateProfile) {
                console.log('User chose to update profile with new information');
                // Cập nhật tất cả thông tin bao gồm địa chỉ mới
                await updateUserProfileRTDB(currentUser.uid, {
                  name,
                  email,
                  phone,
                  address,
                  ...orderInfo,
                });
                console.log('User profile fully updated with new information');
              } else {
                console.log('User chose not to update profile with new address');
                // Chỉ cập nhật thông tin đơn hàng mới nhất, không cập nhật địa chỉ
                await updateUserProfileRTDB(currentUser.uid, orderInfo);
                console.log('Only order information updated, address unchanged');
              }
            } catch (profileError) {
              console.error('Error updating user profile:', profileError);
              // Continue with order process even if profile update fails
            }
          } catch (orderError) {
            console.error('Error saving order to Realtime Database:', orderError);
            // Still show success to user but log the error
            console.error('Order will not be saved to Realtime Database');
          }
        } else {
          // For guest checkout, create a temporary user ID
          const guestId = `guest-${Date.now()}`;
          console.log('Saving order for guest user:', guestId);

          try {
            // Save order to Realtime Database under guest ID
            console.log('Calling createOrderRTDB with guestId:', guestId);
            console.log('Order data being passed:', JSON.stringify(orderData));

            const savedOrderId = await createOrderRTDB(guestId, orderData);
            console.log('Guest order saved with ID:', savedOrderId);
          } catch (guestOrderError) {
            console.error('Error saving guest order to Realtime Database:', guestOrderError);
            // Still show success to user but log the error
          }
        }

        try {
          // Send email notification
          await sendOrderNotification(orderData, email);
          console.log('Order notification sent to admin email');
        } catch (emailError) {
          console.error('Error sending order notification:', emailError);
          // Continue even if email notification fails
        }
      } else {
        // If Firebase is not available, just log the order
        console.error('Firebase is not available, order will not be saved');
        console.log('Order data that would be saved:', orderData);
      }

      setSuccess('Đặt hàng thành công!');

      // Close modal after 5 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 5000);
    } catch (error: any) {
      console.error('Order submission error:', error);
      setError('Đặt hàng thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 overflow-y-auto py-4 md:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto my-4 relative max-h-[90vh]">
          {/* Sticky header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-lg z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Đặt hàng</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">

          {!currentUser && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md dark:bg-yellow-900/30 dark:text-yellow-400">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Bạn chưa đăng nhập. <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Đăng nhập
                </button> để lưu thông tin và tự động điền cho lần sau.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md dark:bg-green-900/30 dark:text-green-400">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Đặt hàng thành công!</span>
              </div>
              <p className="mb-2">Mã đơn hàng của bạn: <span className="font-bold">{orderId}</span></p>
              <p>Chúng tôi sẽ liên hệ với bạn sớm nhất có thể để xác nhận đơn hàng.</p>
              {currentUser && (
                <p className="mt-2 text-sm">Thông tin đơn hàng đã được lưu vào tài khoản của bạn.</p>
              )}
            </div>
          )}

          {infoAutoFilled && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md dark:bg-blue-900/30 dark:text-blue-400 flex justify-between items-center">
              <span>
                {infoEdited
                  ? "Thông tin đã được chỉnh sửa từ dữ liệu tài khoản của bạn."
                  : "Thông tin đã được tự động điền từ tài khoản của bạn."}
              </span>
              {infoEdited && userProfile && (
                <button
                  type="button"
                  onClick={restoreProfileInfo}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Khôi phục
                </button>
              )}
            </div>
          )}

          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden mr-3">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">SL: {quantity}</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 ml-4">{formatPrice((product.salePrice || product.price) * quantity)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Tạm tính:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatPrice((product.salePrice || product.price) * quantity)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Phí vận chuyển:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {shippingMethod === 'express' ? formatPrice(30000) : formatPrice(15000)}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-900 dark:text-white">Tổng cộng:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatPrice((product.salePrice || product.price) * quantity + (shippingMethod === 'express' ? 30000 : 15000))}
                </span>
              </div>
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thông tin khách hàng</h3>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => handleInputChange(setName, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => handleInputChange(setPhone, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                pattern="[0-9]{10,11}"
                title="Số điện thoại phải có 10-11 chữ số"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vui lòng nhập số điện thoại từ 10-11 chữ số (VD: 0912345678)
              </p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Địa chỉ giao hàng
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => handleInputChange(setAddress, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                required
                placeholder="Vui lòng nhập địa chỉ đầy đủ để giao hàng"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vui lòng nhập đầy đủ địa chỉ: Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ghi chú đơn hàng (không bắt buộc)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => handleInputChange(setNotes, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={2}
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
              ></textarea>
            </div>

            {currentUser && infoEdited && (
              <div className="mt-2">
                <div className="flex items-center">
                  <input
                    id="updateProfile"
                    name="updateProfile"
                    type="checkbox"
                    checked={updateProfile}
                    onChange={(e) => setUpdateProfile(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="updateProfile" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                    Cập nhật thông tin này vào tài khoản của tôi
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-7">
                  Nếu bạn không chọn, thông tin này chỉ được sử dụng cho đơn hàng hiện tại
                </p>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thông tin thanh toán và vận chuyển</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phương thức thanh toán
              </label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center">
                  <input
                    id="cod"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="cod" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="bank-transfer"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === 'bank-transfer'}
                    onChange={() => setPaymentMethod('bank-transfer')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="bank-transfer" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                    Chuyển khoản ngân hàng
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phương thức vận chuyển
              </label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center">
                  <input
                    id="standard"
                    name="shippingMethod"
                    type="radio"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="standard" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                    Giao hàng tiêu chuẩn (15.000đ) - 3-5 ngày
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="express"
                    name="shippingMethod"
                    type="radio"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="express" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                    Giao hàng nhanh (30.000đ) - 1-2 ngày
                  </label>
                </div>
              </div>
            </div>

            {/* Thông tin vận chuyển và hỗ trợ từ shop_info.json */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thông tin vận chuyển & hỗ trợ</h3>
              <ShippingInfo className="mt-2" />
            </div>

          </form>
          </div> {/* End of scrollable content */}

          {/* Sticky footer with submit button */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 rounded-b-lg z-10 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Connect button to form by id */}
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                loading
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
              }`}
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode="login"
      />
    </>
  );
}
