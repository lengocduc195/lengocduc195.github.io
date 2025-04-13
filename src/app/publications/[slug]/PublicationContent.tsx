'use client';

import { useState } from 'react';
import { Publication } from '@/lib/dataUtils';
import ImageModal from '@/components/ImageModal';
import VideoModal from '@/components/VideoModal';

interface PublicationContentProps {
  publication: Publication;
}

export default function PublicationContent({ publication: pub }: PublicationContentProps) {
  const [modalImage, setModalImage] = useState<{ url: string; caption?: string } | null>(null);
  const [modalVideo, setModalVideo] = useState<{ videoId?: string; videoUrl?: string; caption?: string } | null>(null);

  // Function to open modal with image
  const openImageModal = (url: string, caption?: string) => {
    setModalImage({ url, caption });
  };

  // Function to close image modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  // Function to open modal with video
  const openVideoModal = (videoId?: string, videoUrl?: string, caption?: string) => {
    setModalVideo({ videoId, videoUrl, caption });
  };

  // Function to close video modal
  const closeVideoModal = () => {
    setModalVideo(null);
  };

  // Helper function to render content items
  const renderContentItems = (items: any[]) => {
    return (
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index}>
            {item.type === 'text' && (
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: item.text ? item.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">$1</strong>') : ''
                }}
              />
            )}
            {item.type === 'image' && item.url && (
              <figure className="my-6 cursor-pointer mx-auto w-[70%]" onClick={() => openImageModal(item.url, item.caption)}>
                <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={item.url}
                    alt={item.caption || 'Publication image'}
                    className="w-full h-auto rounded-lg transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                    <div className="p-3 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-40 transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <svg className="w-6 h-6 text-gray-800 opacity-0 group-hover:opacity-70 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {item.caption && (
                  <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                )}
              </figure>
            )}
            {item.type === 'video' && (
              <div className="my-4 cursor-pointer mx-auto w-[70%]">
                {item.videoId ? (
                  <div
                    className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 aspect-video"
                    onClick={() => openVideoModal(item.videoId, undefined, item.caption)}
                  >
                    <iframe
                      className="absolute inset-0 w-full h-full rounded-md transform group-hover:scale-105 transition-transform duration-500"
                      src={`https://www.youtube.com/embed/${item.videoId}`}
                      title={item.caption || 'Video'}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                      <div className="p-3 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-40 transform scale-0 group-hover:scale-100 transition-all duration-300">
                        <svg className="w-6 h-6 text-gray-800 opacity-0 group-hover:opacity-70 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : item.url ? (
                  <div
                    className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 aspect-video"
                    onClick={() => openVideoModal(undefined, item.url, item.caption)}
                  >
                    <video
                      className="absolute inset-0 w-full h-full object-cover rounded-md transform group-hover:scale-105 transition-transform duration-500"
                      controls
                      poster={item.url.replace(/\.[^/.]+$/, '') + '-thumbnail.jpg'}
                    >
                      <source src={item.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                      <div className="p-3 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-40 transform scale-0 group-hover:scale-100 transition-all duration-300">
                        <svg className="w-6 h-6 text-gray-800 opacity-0 group-hover:opacity-70 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : null}
                {item.caption && (
                  <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Problem Section */}
      {pub.problem && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold mb-3 text-xl text-gray-800 dark:text-gray-200 flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md shadow-sm">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Problem
          </h3>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-6">
            {typeof pub.problem === 'string' ? (
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: pub.problem.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">$1</strong>') }} />
            ) : Array.isArray(pub.problem) ? (
              renderContentItems(pub.problem)
            ) : null}
          </div>
        </div>
      )}

      {/* Gap Section */}
      {pub.gap && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold mb-3 text-xl text-gray-800 dark:text-gray-200 flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md shadow-sm">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Gap
          </h3>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-6">
            {typeof pub.gap === 'string' ? (
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: pub.gap.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">$1</strong>') }} />
            ) : Array.isArray(pub.gap) ? (
              renderContentItems(pub.gap)
            ) : null}
          </div>
        </div>
      )}

      {/* Solution Section */}
      {pub.solution && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold mb-3 text-xl text-gray-800 dark:text-gray-200 flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md shadow-sm">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Proposed Method
          </h3>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-6">
            {typeof pub.solution === 'string' ? (
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: pub.solution.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">$1</strong>') }} />
            ) : Array.isArray(pub.solution) ? (
              renderContentItems(pub.solution)
            ) : null}
          </div>
        </div>
      )}

      {/* Results Section */}
      {pub.results && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold mb-3 text-xl text-gray-800 dark:text-gray-200 flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md shadow-sm">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Key Results
          </h3>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-6">
            {typeof pub.results === 'string' ? (
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: pub.results.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">$1</strong>') }} />
            ) : Array.isArray(pub.results) ? (
              renderContentItems(pub.results)
            ) : null}
          </div>
        </div>
      )}

      {/* Insights Section */}
      {pub.insights && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold mb-3 text-xl text-gray-800 dark:text-gray-200 flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md shadow-sm">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Insights & Observations
          </h3>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-6">
            {typeof pub.insights === 'string' ? (
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: pub.insights.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">$1</strong>') }} />
            ) : Array.isArray(pub.insights) ? (
              renderContentItems(pub.insights)
            ) : null}
          </div>
        </div>
      )}

      {/* Contributions Section */}
      {pub.contributions && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold mb-3 text-xl text-gray-800 dark:text-gray-200 flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md shadow-sm">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
            </svg>
            Contributions & Future Work
          </h3>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-6">
            {typeof pub.contributions === 'string' ? (
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: pub.contributions.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">$1</strong>') }} />
            ) : Array.isArray(pub.contributions) ? (
              renderContentItems(pub.contributions)
            ) : null}
          </div>
        </div>
      )}

      {/* Images Section */}
      {Array.isArray(pub.images) && pub.images.length > 0 && (
        <div className="mt-8 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Images:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pub.images.map((img, index) => (
              typeof img === 'object' && img.url ? (
                <div
                  key={index}
                  className="cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => openImageModal(img.url, img.caption)}
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Publication illustration ${index + 1}`}
                    className="w-full h-auto rounded-md transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                    <div className="p-3 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-40 transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <svg className="w-6 h-6 text-gray-800 opacity-0 group-hover:opacity-70 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                  {img.caption && <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">{img.caption}</p>}
                </div>
              ) : typeof img === 'string' ? (
                <div
                  key={index}
                  className="cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => openImageModal(img)}
                >
                  <img
                    src={img}
                    alt={`Publication illustration ${index + 1}`}
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
              ) : null
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          imageUrl={modalImage.url}
          caption={modalImage.caption}
          onClose={closeImageModal}
        />
      )}

      {/* Video Modal */}
      {modalVideo && (
        <VideoModal
          isOpen={!!modalVideo}
          videoId={modalVideo.videoId}
          videoUrl={modalVideo.videoUrl}
          caption={modalVideo.caption}
          onClose={closeVideoModal}
        />
      )}
    </>
  );
}
