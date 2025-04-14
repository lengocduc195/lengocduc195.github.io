'use client';

import { useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  videoUrl?: string;
  videoId?: string;
  caption?: string;
  onClose: () => void;
}

export default function VideoModal({ isOpen, videoUrl, videoId, caption, onClose }: VideoModalProps) {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-[95vw] h-[95vh] overflow-hidden flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black bg-opacity-70 text-white hover:bg-opacity-90 transition-all duration-200"
          onClick={onClose}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video */}
        <div className="w-full h-full max-w-[90vw] max-h-[80vh] flex items-center justify-center">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={caption || 'Video'}
              className="w-full h-full rounded-lg shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="max-h-[80vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
            >
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>

        {/* Caption */}
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-70 text-white text-center">
            <p className="text-base md:text-lg">{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
