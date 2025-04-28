'use client';

import { Project } from '@/lib/dataUtils';
import { useState } from 'react';
import ImageModal from '@/components/ImageModal';

interface ProjectHighlightsProps {
  project: Project;
}

export default function ProjectHighlights({ project }: ProjectHighlightsProps) {
  const [modalImage, setModalImage] = useState<{ url: string; caption?: string } | null>(null);

  // Function to open modal with image
  const openImageModal = (url: string, caption?: string) => {
    setModalImage({ url, caption });
  };

  // Function to close modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  // Helper function to render content items
  const renderContentItems = (items: any[]) => {
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            {item.type === 'text' && (
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: item.text ? item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : ''
                }}
              />
            )}
            {item.type === 'image' && item.url && (
              <figure className="my-4 cursor-pointer" onClick={() => openImageModal(item.url, item.caption)}>
                <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={item.url}
                    alt={item.caption || 'Project image'}
                    className="w-full h-auto rounded-lg transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                    <div className="p-3 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-40 transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                {item.caption && (
                  <figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render a single content item or array of items
  const renderContentItem = (item: any) => {
    if (!item) return null;

    // If item is an array, use renderContentItems
    if (Array.isArray(item)) {
      return renderContentItems(item);
    }

    // Otherwise render a single item
    return (
      <div
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{
          __html: item.text ? item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : ''
        }}
      />
    );
  };

  return (
    <>
      {/* Problem Statement Section */}
      {project.problem_statement && (
        <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-lg border-l-4 border-red-500">
          <h3 className="text-xl font-bold mb-3 text-red-700 dark:text-red-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Problem Statement
          </h3>
          {renderContentItem(project.problem_statement)}
        </div>
      )}

      {/* My Role Section */}
      {project.my_role && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-3 text-blue-700 dark:text-blue-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Role
          </h3>
          {renderContentItem(project.my_role)}
        </div>
      )}

      {/* Technical Solution Section */}
      {project.technical_solution && (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border-l-4 border-green-500">
          <h3 className="text-xl font-bold mb-3 text-green-700 dark:text-green-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Technical Solution
          </h3>
          {Array.isArray(project.technical_solution)
            ? renderContentItems(project.technical_solution)
            : renderContentItem(project.technical_solution)}
        </div>
      )}

      {/* Measurement & Improvement Section */}
      {project.measurement_improvement && (
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border-l-4 border-purple-500">
          <h3 className="text-xl font-bold mb-3 text-purple-700 dark:text-purple-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Measurement & Improvement
          </h3>
          {renderContentItem(project.measurement_improvement)}
        </div>
      )}

      {/* Implementation & Integration Section */}
      {project.implementation_integration && (
        <div className="mb-8 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-lg border-l-4 border-yellow-500">
          <h3 className="text-xl font-bold mb-3 text-yellow-700 dark:text-yellow-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            Implementation & Integration
          </h3>
          {renderContentItem(project.implementation_integration)}
        </div>
      )}

      {/* Real-World Impact Section */}
      {project.real_world_impact && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-lg border-l-4 border-indigo-500">
          <h3 className="text-xl font-bold mb-3 text-indigo-700 dark:text-indigo-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Real-World Impact
          </h3>
          {renderContentItem(project.real_world_impact)}
        </div>
      )}

      {/* Company Alignment Section */}
      {project.company_alignment && (
        <div className="mb-8 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-6 rounded-lg border-l-4 border-pink-500">
          <h3 className="text-xl font-bold mb-3 text-pink-700 dark:text-pink-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Company Alignment
          </h3>
          {renderContentItem(project.company_alignment)}
        </div>
      )}

      {modalImage && (
        <ImageModal
          imageUrl={modalImage.url}
          caption={modalImage.caption}
          onClose={closeImageModal}
        />
      )}
    </>
  );
}
