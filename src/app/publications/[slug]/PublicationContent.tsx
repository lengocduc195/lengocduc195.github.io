'use client';

import { useState, useEffect } from 'react';
import { Publication } from '@/lib/dataUtils';
import katex from 'katex';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

interface PublicationContentProps {
  publication: Publication;
  section?: 'problem' | 'gap' | 'solution' | 'results' | 'insights' | 'contributions' | 'all';
}

export default function PublicationContent({ publication, section = 'all' }: PublicationContentProps) {
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

  // Helper function to format text with references and LaTeX math
  const formatTextWithReferences = (text: string): string => {
    if (!text) return '';

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
    if (publication.references) {
      Object.entries(publication.references).forEach(([key, value]) => {
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

  // Function to render content based on type
  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return (
        <div
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatTextWithReferences(content) }}
        />
      );
    } else if (Array.isArray(content)) {
      return (
        <div className="space-y-6">
          {content.map((item, index) => (
            <div key={index}>
              {item.type === 'text' && (
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: item.text ? formatTextWithReferences(item.text) : ''
                  }}
                />
              )}
              {/* Image rendering is handled by the parent component */}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // References Section
  const renderReferences = () => {
    if (!publication.references || Object.keys(publication.references).length === 0) {
      return null;
    }

    return (
      <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-lg text-gray-700 dark:text-gray-300 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          References
        </h3>
        <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
          {Object.entries(publication.references).map(([key, value]) => (
            <li id={`reference-${key}`} key={key} className="pl-2 py-2 border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 rounded-r-md scroll-mt-24 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200">
              {value}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  // Render specific section or all sections based on the section prop
  const renderSection = () => {
    switch (section) {
      case 'problem':
        return publication.problem ? renderContent(publication.problem) : null;
      case 'gap':
        return publication.gap ? renderContent(publication.gap) : null;
      case 'solution':
        return publication.solution ? renderContent(publication.solution) : null;
      case 'results':
        return publication.results ? renderContent(publication.results) : null;
      case 'insights':
        return publication.insights ? renderContent(publication.insights) : null;
      case 'contributions':
        return publication.contributions ? renderContent(publication.contributions) : null;
      case 'all':
        return (
          <>
            {/* Problem Section */}
            {publication.problem && (
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                {renderContent(publication.problem)}
              </div>
            )}

            {/* Gap Section */}
            {publication.gap && (
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                {renderContent(publication.gap)}
              </div>
            )}

            {/* Solution Section */}
            {publication.solution && (
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                {renderContent(publication.solution)}
              </div>
            )}

            {/* Results Section */}
            {publication.results && (
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                {renderContent(publication.results)}
              </div>
            )}

            {/* Insights Section */}
            {publication.insights && (
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                {renderContent(publication.insights)}
              </div>
            )}

            {/* Contributions Section */}
            {publication.contributions && (
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                {renderContent(publication.contributions)}
              </div>
            )}

            {/* References Section */}
            {renderReferences()}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
      {renderSection()}
    </div>
  );
}
