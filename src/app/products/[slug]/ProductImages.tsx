'use client';

import { useState } from 'react';
import ImageModal from '@/components/ImageModal';

interface ProductImagesProps {
  images: Array<{ url: string; caption?: string } | string>;
}

export default function ProductImages({ images }: ProductImagesProps) {
  const [modalImage, setModalImage] = useState<{ url: string; caption?: string } | null>(null);

  // Function to open modal with image
  const openImageModal = (url: string, caption?: string) => {
    setModalImage({ url, caption });
  };

  // Function to close modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">More Images:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((img, index) => {
            if (typeof img === 'object' && img.url) {
              return (
                <div
                  key={index}
                  className="cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => openImageModal(img.url, img.caption)}
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Product image ${index + 1}`}
                    className="w-full h-auto rounded-md transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                    <div className="p-3 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-40 transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <svg className="w-6 h-6 text-gray-800 opacity-0 group-hover:opacity-70 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                  {img.caption && (
                    <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">{img.caption}</p>
                  )}
                </div>
              );
            } else if (typeof img === 'string') {
              return (
                <div
                  key={index}
                  className="cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => openImageModal(img)}
                >
                  <img
                    src={img}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-auto rounded-md transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                    <div className="p-3 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-40 transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <svg className="w-6 h-6 text-gray-800 opacity-0 group-hover:opacity-70 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          imageUrl={modalImage.url}
          caption={modalImage.caption}
          onClose={closeImageModal}
        />
      )}
    </>
  );
}
