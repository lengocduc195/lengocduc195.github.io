'use client';

// Thêm script này vào trang để xử lý việc phóng to ảnh
export function initImageViewer() {
  // Chỉ chạy ở phía client
  if (typeof window === 'undefined') return;

  // Tạo modal container nếu chưa tồn tại
  let modalContainer = document.getElementById('image-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'image-modal-container';
    modalContainer.className = 'fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black bg-opacity-80 transition-opacity duration-300';
    modalContainer.innerHTML = `
      <div class="relative max-w-5xl max-h-[90vh] overflow-auto" onclick="event.stopPropagation()">
        <button 
          id="close-modal-button"
          class="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div class="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          <img 
            id="modal-image"
            src="" 
            alt="Enlarged image" 
            class="w-full h-auto max-h-[80vh] object-contain"
          />
          <div id="modal-caption-container" class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 hidden">
            <p id="modal-caption" class="text-gray-700 dark:text-gray-300 italic text-center"></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalContainer);

    // Thêm sự kiện đóng modal
    modalContainer.addEventListener('click', () => {
      modalContainer.classList.remove('flex');
      modalContainer.classList.add('hidden');
    });

    const closeButton = document.getElementById('close-modal-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        modalContainer.classList.remove('flex');
        modalContainer.classList.add('hidden');
      });
    }
  }

  // Thêm sự kiện click cho tất cả các ảnh có class 'zoomable-image'
  const images = document.querySelectorAll('.zoomable-image');
  images.forEach(img => {
    if (!img.dataset.hasZoomEvent) {
      img.dataset.hasZoomEvent = 'true';
      img.style.cursor = 'pointer';
      
      img.addEventListener('click', () => {
        const modalImage = document.getElementById('modal-image');
        const modalCaption = document.getElementById('modal-caption');
        const modalCaptionContainer = document.getElementById('modal-caption-container');
        
        if (modalImage) {
          modalImage.src = img.src;
          modalImage.alt = img.alt || 'Enlarged image';
        }
        
        if (modalCaption && modalCaptionContainer) {
          const caption = img.dataset.caption;
          if (caption) {
            modalCaption.textContent = caption;
            modalCaptionContainer.classList.remove('hidden');
          } else {
            modalCaptionContainer.classList.add('hidden');
          }
        }
        
        modalContainer.classList.remove('hidden');
        modalContainer.classList.add('flex');
      });
    }
  });
}
