'use client';

import { useState } from 'react';

// Image Modal Component
const ImageModal = ({ isOpen, onClose, imageSrc, caption }: { isOpen: boolean, onClose: () => void, imageSrc: string, caption?: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 transition-opacity duration-300" onClick={onClose}>
      <div className="relative max-w-5xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          <img 
            src={imageSrc} 
            alt={caption || "Enlarged image"} 
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          {caption && (
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 italic text-center">{caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Gallery Image Component
const GalleryImage = ({ src, alt, caption }: { src: string, alt: string, caption?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className="overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="w-full h-64 object-cover object-center transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
            <div className="bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 hover:opacity-100 transform scale-90 hover:scale-100 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
        {caption && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 italic">
              <svg className="w-4 h-4 inline-block mr-1 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {caption}
            </p>
          </div>
        )}
      </div>
      <ImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageSrc={src} 
        caption={caption} 
      />
    </>
  );
};

// Section Image Component
const SectionImage = ({ src, alt, caption }: { src: string, alt: string, caption?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
            <div className="bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 hover:opacity-100 transform scale-90 hover:scale-100 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
        {caption && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 italic flex items-start">
              <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{caption}</span>
            </p>
          </div>
        )}
      </div>
      <ImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageSrc={src} 
        caption={caption} 
      />
    </>
  );
};

// Image Gallery Component
export const ImageGallery = ({ images, title }: { images: any[], title: string }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        {title || "Memories Gallery"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((image, index) => {
          const imgSrc = typeof image === 'string' ? image : image.url;
          const imgAlt = typeof image === 'string' ? title : (image.caption || title);
          const caption = typeof image !== 'string' ? image.caption : null;

          if (!imgSrc) return null;

          return (
            <GalleryImage 
              key={index} 
              src={imgSrc} 
              alt={imgAlt} 
              caption={caption} 
            />
          );
        })}
      </div>
    </div>
  );
};

export { GalleryImage, SectionImage };
