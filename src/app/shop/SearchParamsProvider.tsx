'use client';

import { useSearchParams } from 'next/navigation';
import { createContext, useContext, ReactNode } from 'react';

// Tạo context để lưu trữ searchParams
const SearchParamsContext = createContext<{ category: string | null }>({
  category: null
});

// Hook để sử dụng searchParams
export const useSearchParamsContext = () => useContext(SearchParamsContext);

// Provider component
export default function SearchParamsProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  return (
    <SearchParamsContext.Provider value={{ category }}>
      {children}
    </SearchParamsContext.Provider>
  );
}
