'use client';

import { useEffect } from 'react';
import { initImageViewer } from '../components/ImageViewer';

export default function ImageViewerScript() {
  useEffect(() => {
    // Khởi tạo chức năng phóng to ảnh
    initImageViewer();
    
    // Thêm sự kiện để khởi tạo lại khi DOM thay đổi
    const observer = new MutationObserver(() => {
      initImageViewer();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return null;
}
