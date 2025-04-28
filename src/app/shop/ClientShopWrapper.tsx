'use client';

import { Suspense } from 'react';
import ShopProductList from './ShopProductList';
import { ShopProduct } from '@/lib/shopUtils';

interface ClientShopWrapperProps {
  initialProducts: ShopProduct[];
}

export default function ClientShopWrapper({ initialProducts }: ClientShopWrapperProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <ShopProductList initialProducts={initialProducts} />
    </Suspense>
  );
}
