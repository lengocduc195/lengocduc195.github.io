'use client';

import { useState } from 'react';
import ImageModal from './ImageModal';

interface PublicationImageViewerProps {
  url: string;
  caption?: string;
  className?: string;
}

export default function PublicationImageViewer({ url, caption, className = '' }: PublicationImageViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <img
        src={url}
        alt={caption || 'Publication image'}
        className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => setIsModalOpen(true)}
      />
      {isModalOpen && (
        <ImageModal
          isOpen={isModalOpen}
          imageUrl={url}
          caption={caption}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
