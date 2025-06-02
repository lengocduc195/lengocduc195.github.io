'use client';

import { useState, useEffect } from 'react';
import { registerUser, loginUser, createUserProfile, createUserProfileRTDB, rtdb } from '@/lib/firebase';
import { ref, set, serverTimestamp } from 'firebase/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, mode = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      setSuccess('Đăng nhập thành công!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      // Filter out Firebase configuration errors
      if (error.message.includes('Firebase authentication is not initialized')) {
        setError('Hệ thống đăng nhập đang được bảo trì. Vui lòng thử lại sau.');
      } else {
        setError('Đăng nhập thất bại: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Starting registration process for email:', email);
      // Register user with default role 'user'
      const user = await registerUser(email, password, 'user');
      console.log('User registered successfully with Firebase Auth, UID:', user.uid);

      // User profile data
      const userData = {
        email,
        name,
        phone,
        address,
        role: 'user', // Explicitly set role
        createdAt: new Date(),
      };
      console.log('Prepared user data for storage:', { ...userData, createdAt: userData.createdAt.toString() });

      let rtdbSuccess = false;
      let firestoreSuccess = false;

      // Try to store in Realtime Database (primary storage)
      try {
        console.log('Attempting to store user data in Realtime Database');
        await createUserProfileRTDB(user.uid, userData);
        console.log('Successfully stored user data in Realtime Database');
        rtdbSuccess = true;
      } catch (rtdbError) {
        console.error('Failed to store user data in Realtime Database:', rtdbError);
        // Continue to try Firestore as fallback
      }

      // Also store in Firestore for backward compatibility or as fallback
      try {
        console.log('Attempting to store user data in Firestore');
        await createUserProfile(user.uid, userData);
        console.log('Successfully stored user data in Firestore');
        firestoreSuccess = true;
      } catch (firestoreError) {
        console.error('Failed to store user data in Firestore:', firestoreError);
      }

      if (rtdbSuccess || firestoreSuccess) {
        console.log('User data stored successfully in at least one database');
        setSuccess('Đăng ký thành công! Bạn đã được đăng nhập tự động.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Both storage attempts failed, but auth succeeded
        console.warn('User was created in Auth but profile storage failed');
        setSuccess('Đăng ký thành công, nhưng lưu thông tin cá nhân thất bại. Bạn có thể cập nhật thông tin sau.');
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Filter out Firebase configuration errors
      if (error.message.includes('Firebase authentication is not initialized')) {
        setError('Hệ thống đăng ký đang được bảo trì. Vui lòng thử lại sau.');
      } else if (error.message.includes('auth/email-already-in-use')) {
        setError('Email này đã được đăng ký. Bạn có thể đăng nhập với email này hoặc sử dụng email khác.');
        // Thêm nút chuyển sang đăng nhập
        setTimeout(() => {
          setMode('login');
          setError('');
        }, 3000);
      } else {
        console.error('Registration error details:', error);
        setError('Đăng ký thất bại: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-container bg-black bg-opacity-50">
      <div className="auth-modal-content bg-white dark:bg-gray-800 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-2 font-medium text-center ${
                activeTab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Đăng nhập
            </button>
            <button
              className={`flex-1 py-2 font-medium text-center ${
                activeTab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('register')}
            >
              Đăng ký
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md dark:bg-green-900/30 dark:text-green-400">
            {success}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
              }`}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="register-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                pattern="[0-9]{10,11}"
                title="Số điện thoại phải có 10-11 chữ số"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vui lòng nhập số điện thoại từ 10-11 chữ số (VD: 0912345678)
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Địa chỉ giao hàng
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                rows={3}
                placeholder="Vui lòng nhập địa chỉ đầy đủ để giao hàng"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vui lòng nhập đầy đủ địa chỉ: Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
              }`}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
