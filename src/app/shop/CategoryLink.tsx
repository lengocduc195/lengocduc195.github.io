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
      // Tìm tất cả các nút danh mục (category pills)
      const categoryButtons = document.querySelectorAll('button[data-category]');
      let targetButton: Element | null = null;

      // Tìm nút có data-category khớp với category (không phân biệt chữ hoa/thường)
      categoryButtons.forEach(button => {
        const buttonCategory = button.getAttribute('data-category');
        if (buttonCategory && buttonCategory.toLowerCase() === category.toLowerCase()) {
          targetButton = button;
        }
      });

      // Nếu tìm thấy nút, click vào nó
      if (targetButton) {
        (targetButton as HTMLButtonElement).click();
      } else {
        // Nếu không tìm thấy nút, thử tìm và chọn tùy chọn trong dropdown
        const options = document.querySelectorAll('select option');
        let targetOption: HTMLOptionElement | null = null;

        options.forEach(option => {
          const optionValue = option.value;
          if (optionValue.toLowerCase() === category.toLowerCase()) {
            targetOption = option as HTMLOptionElement;
          }
        });

        if (targetOption) {
          targetOption.selected = true;
          // Trigger change event
          const event = new Event('change', { bubbles: true });
          targetOption.parentElement?.dispatchEvent(event);
        } else {
          // Nếu không tìm thấy cả nút và tùy chọn, cập nhật URL trực tiếp
          const url = new URL(window.location.href);
          url.searchParams.set('category', category);
          window.history.pushState({}, '', url.toString());

          // Reload trang để áp dụng bộ lọc
          window.location.reload();
        }
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
