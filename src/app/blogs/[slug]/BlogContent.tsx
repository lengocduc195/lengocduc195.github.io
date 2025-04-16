'use client';

import { useState, useEffect } from 'react';
import { Blog } from '@/lib/dataUtils';
import ImageModal from '@/components/ImageModal';
import katex from 'katex';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

interface BlogContentProps {
  blog: Blog;
}

export default function BlogContent({ blog }: BlogContentProps) {
  const [modalImage, setModalImage] = useState<{ url: string; caption?: string } | null>(null);

  // Add custom CSS for KaTeX
  useEffect(() => {
    // Add custom styles for KaTeX display
    const style = document.createElement('style');
    style.innerHTML = `
      .katex-display {
        margin: 1.5rem 0;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 1.5rem;
        background-color: rgba(17, 24, 39, 0.95); /* Dark cosmic blue background */
        border-radius: 0.75rem;
        border: 1px solid rgba(59, 130, 246, 0.3); /* Subtle blue border */
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); /* Soft blue glow */
      }

      /* Add more space around the formula */
      .katex-display > .katex {
        padding: 0.5rem 0;
        display: flex;
        justify-content: center;
        color: rgba(255, 255, 255, 0.98); /* White text for formulas */
      }

      .dark .katex-display {
        background-color: rgba(15, 23, 42, 0.95); /* Darker cosmic blue in dark mode */
        border: 1px solid rgba(59, 130, 246, 0.4); /* Slightly more visible blue border in dark mode */
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); /* Stronger blue glow in dark mode */
      }

      .dark .katex-display > .katex {
        color: rgba(255, 255, 255, 0.98); /* White text for dark mode */
      }

      .katex-inline {
        padding: 0.1rem 0.3rem;
        margin: 0 0.1rem;
        background-color: rgba(17, 24, 39, 0.9); /* Dark cosmic blue background */
        border-radius: 0.25rem;
        border: 1px solid rgba(59, 130, 246, 0.25); /* Subtle blue border */
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1); /* Soft blue glow */
        color: rgba(255, 255, 255, 0.98); /* White text for formulas */
      }

      .dark .katex-inline {
        background-color: rgba(15, 23, 42, 0.9); /* Darker cosmic blue in dark mode */
        border: 1px solid rgba(59, 130, 246, 0.3); /* Slightly more visible blue border in dark mode */
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15); /* Stronger blue glow in dark mode */
        color: rgba(255, 255, 255, 0.98); /* White text for formulas */
      }

      .katex-error {
        color: #ef4444;
        font-family: monospace;
        padding: 0.5rem;
        border: 1px dashed #ef4444;
        border-radius: 0.25rem;
        margin: 1rem 0;
      }

      /* Tooltip styles for references */
      .tooltip-reference {
        position: relative;
        cursor: pointer;
      }

      .tooltip-reference:hover::after {
        content: attr(title);
        position: absolute;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(17, 24, 39, 0.9);
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        white-space: nowrap;
        z-index: 10;
        max-width: 300px;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .tooltip-reference:hover::before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px;
        border-style: solid;
        border-color: rgba(17, 24, 39, 0.9) transparent transparent transparent;
        z-index: 10;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to open modal with image
  const openImageModal = (url: string, caption?: string | undefined) => {
    setModalImage({ url, caption });
  };

  // Function to close modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  // Ưu tiên content, sau đó đến excerpt hoặc description
  const displayContent = blog.content ?? blog.excerpt ?? blog.description;

  // Helper function to format text with references and LaTeX math
  const formatTextWithReferences = (text: string): string => {
    // First replace all [ref:X] with placeholders to avoid processing them twice
    let processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Process LaTeX math expressions
    // Find all instances of $$...$$ (display math)
    const displayMathRegex = /\$\$(.*?)\$\$/gs;
    const displayMathMatches = [...processedText.matchAll(displayMathRegex)];

    // Replace each match with a placeholder
    const displayMathPlaceholders: {[key: string]: string} = {};
    displayMathMatches.forEach((match, index) => {
      const placeholder = `__DISPLAY_MATH_${index}__`;
      displayMathPlaceholders[placeholder] = match[1];
      processedText = processedText.replace(match[0], placeholder);
    });

    // Find all instances of $...$ (inline math)
    const inlineMathRegex = /\$(.*?)\$/gs;
    const inlineMathMatches = [...processedText.matchAll(inlineMathRegex)];

    // Replace each match with a placeholder
    const inlineMathPlaceholders: {[key: string]: string} = {};
    inlineMathMatches.forEach((match, index) => {
      const placeholder = `__INLINE_MATH_${index}__`;
      inlineMathPlaceholders[placeholder] = match[1];
      processedText = processedText.replace(match[0], placeholder);
    });

    // Then replace each [ref:X] with a link that has a title attribute
    if (blog.references) {
      Object.entries(blog.references).forEach(([key, value]) => {
        const refPattern = new RegExp(`\\[ref:${key}\\]`, 'g');
        // Escape the value for use in title attribute
        const escapedValue = value.replace(/"/g, '&quot;');
        processedText = processedText.replace(
          refPattern,
          `<a href="#reference-${key}" class="text-blue-600 dark:text-blue-400 hover:underline tooltip-reference" title="${escapedValue}">[ref:${key}]</a>`
        );
      });
    } else {
      // Fallback if no references object is available
      processedText = processedText.replace(
        /\[ref:(\d+)\]/g,
        '<a href="#reference-$1" class="text-blue-600 dark:text-blue-400 hover:underline">[ref:$1]</a>'
      );
    }

    // Now replace the math placeholders with rendered LaTeX
    Object.entries(displayMathPlaceholders).forEach(([placeholder, latex]) => {
      try {
        const renderedMath = katex.renderToString(latex, {
          displayMode: true,
          throwOnError: false,
          output: 'html'
        });
        processedText = processedText.replace(placeholder, `<div class="katex-display">${renderedMath}</div>`);
      } catch (error) {
        console.error('Error rendering display math:', error);
        processedText = processedText.replace(placeholder, `<div class="katex-error">$$${latex}$$</div>`);
      }
    });

    Object.entries(inlineMathPlaceholders).forEach(([placeholder, latex]) => {
      try {
        const renderedMath = katex.renderToString(latex, {
          displayMode: false,
          throwOnError: false,
          output: 'html'
        });
        processedText = processedText.replace(placeholder, `<span class="katex-inline">${renderedMath}</span>`);
      } catch (error) {
        console.error('Error rendering inline math:', error);
        processedText = processedText.replace(placeholder, `<span class="katex-error">$${latex}$</span>`);
      }
    });

    return processedText;
  };

  return (
    <>
      {/* Content Section */}
      {displayContent && (
        <div className="prose dark:prose-invert max-w-none mb-6">
          {Array.isArray(blog.content) ? (
            <div className="space-y-6">
              {blog.content.map((item, index) => (
                <div key={index}>
                  {item.type === 'text' && (
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: item.text ? formatTextWithReferences(item.text) : ''
                      }}
                    />
                  )}
                  {item.type === 'image' && item.url && (
                    <figure className="my-6 cursor-pointer" onClick={() => item.url ? openImageModal(item.url, item.caption) : null}>
                      <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                        <img
                          src={item.url}
                          alt={item.caption || 'Blog image'}
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
                        <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: typeof displayContent === 'string' ? formatTextWithReferences(displayContent) : ''
              }}
            />
          )}
        </div>
      )}

      {/* Notable Observations Section - Placed right after content */}
      {Array.isArray(blog.notableObservations) && blog.notableObservations.length > 0 && (
        <div className="mb-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-lg text-blue-700 dark:text-blue-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Notable Observations
          </h3>
          <ul className="space-y-3 list-disc list-inside text-gray-700 dark:text-gray-300">
            {blog.notableObservations.map((observation, index) => (
              <li key={index} className="pl-2 py-1 border-l-4 border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-r-md">
                {observation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unexpected Insights Section - Placed after Notable Observations */}
      {Array.isArray(blog.unexpectedInsights) && blog.unexpectedInsights.length > 0 && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-lg text-purple-700 dark:text-purple-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Unexpected Insights
          </h3>
          <ul className="space-y-3 list-disc list-inside text-gray-700 dark:text-gray-300">
            {blog.unexpectedInsights.map((insight, index) => (
              <li key={index} className="pl-2 py-1 border-l-4 border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-r-md">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* More Images Section - Placed after Unexpected Insights */}
      {Array.isArray(blog.images) && blog.images.length > 0 && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">More Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blog.images.map((img, index) => {
              if (typeof img === 'object' && img.url) {
                return (
                  <div
                    key={index}
                    className="cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                    onClick={() => openImageModal(img.url, img.caption)}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || `Blog image ${index + 1}`}
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
                      alt={`Blog image ${index + 1}`}
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
      )}

      {/* References Section */}
      {blog.references && Object.keys(blog.references).length > 0 && (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-lg text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            References
          </h3>
          <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
            {Object.entries(blog.references).map(([key, value]) => (
              <li id={`reference-${key}`} key={key} className="pl-2 py-2 border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 rounded-r-md scroll-mt-24 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200">
                {value}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Topics, Tags & Keywords */}
      {(Array.isArray(blog.topics) && blog.topics.length > 0) ||
       (Array.isArray(blog.tags) && blog.tags.length > 0) ||
       (Array.isArray(blog.keywords) && blog.keywords.length > 0) ||
       (Array.isArray(blog.technologies) && blog.technologies.length > 0) ? (
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {Array.isArray(blog.topics) && blog.topics.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Topics</h3>
              <div className="inline-flex flex-wrap gap-2">
                {blog.topics.map((topic) => (
                  typeof topic === 'string' && (
                    <span key={topic} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
                      {topic}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}

          {Array.isArray(blog.technologies) && blog.technologies.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Technologies</h3>
              <div className="inline-flex flex-wrap gap-2">
                {blog.technologies.map((tech) => (
                  typeof tech === 'string' && (
                    <span key={tech} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      {tech}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}

          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Tags</h3>
              <div className="inline-flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  typeof tag === 'string' && (
                    <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                      {tag}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}

          {Array.isArray(blog.keywords) && blog.keywords.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Keywords</h3>
              <div className="inline-flex flex-wrap gap-2">
                {blog.keywords.map((keyword) => (
                  typeof keyword === 'string' && (
                    <span key={keyword} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                      {keyword}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      ): null}

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
