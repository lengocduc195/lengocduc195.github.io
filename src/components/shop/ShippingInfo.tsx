'use client';

import { useState, useEffect } from 'react';

interface ShippingInfoProps {
  className?: string;
}

interface ShopInfoData {
  shipping: {
    title: string;
    items: string[];
  };
  support: {
    title: string;
    items: string[];
  };
}

export default function ShippingInfo({ className = '' }: ShippingInfoProps) {
  const [shopInfo, setShopInfo] = useState<ShopInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const response = await fetch('/assets/data/shop_info.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setShopInfo({
          shipping: data.shipping,
          support: data.support
        });
      } catch (err: any) {
        console.error('Error fetching shop info:', err);
        setError(err.message || 'Không thể tải thông tin vận chuyển');
      } finally {
        setLoading(false);
      }
    };

    fetchShopInfo();
  }, []);

  if (loading) {
    return (
      <div className={`p-3 text-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-3 text-center text-red-500 dark:text-red-400 ${className}`}>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!shopInfo) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Shipping Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          {shopInfo.shipping.title}
        </h4>
        <ul className="space-y-1.5">
          {shopInfo.shipping.items.map((item, index) => (
            <li key={index} className="flex items-start text-sm">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Support Information */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3">
        <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
          {shopInfo.support.title}
        </h4>
        <ul className="space-y-1.5">
          {shopInfo.support.items.map((item, index) => (
            <li key={index} className="flex items-start text-sm">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
