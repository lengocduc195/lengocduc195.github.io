'use client';

import { useEffect } from 'react';

interface CategoryLinkProps {
  category: string;
  children: React.ReactNode;
}

export default function CategoryLink({ category, children }: CategoryLinkProps) {
  const handleClick = () => {
    // Scroll to products section
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    
    // Find and click the category selector with a small delay to ensure the scroll completes
    setTimeout(() => {
      const selector = document.querySelector(`select option[value="${category}"]`) as HTMLOptionElement;
      if (selector) {
        selector.selected = true;
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        selector.parentElement?.dispatchEvent(event);
      }
    }, 500);
  };

  return (
    <a 
      href="#products" 
      onClick={handleClick}
      className="inline-flex items-center text-white hover:text-yellow-300 transition-colors"
    >
      {children}
    </a>
  );
}
