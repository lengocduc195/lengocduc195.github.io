'use client';

import { useState, useEffect, useRef } from 'react';

interface CitationWithCopyProps {
  citationText: string;
  citationCount?: number;
}

export default function CitationWithCopy({ citationText, citationCount }: CitationWithCopyProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopied(true);
      setShowTooltip(true);
      
      // Reset copied state after 2 seconds
      tooltipTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        setShowTooltip(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="mt-8 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">
          Citation
          {citationCount !== undefined && citationCount !== null && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              [Citations: {citationCount}]
            </span>
          )}
        </h3>
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ml-2"
            aria-label="Copy citation"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="sr-only">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span className="sr-only">Copy citation</span>
              </>
            )}
          </button>
          
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
              {copied ? 'Copied!' : 'Copy citation'}
              <div className="absolute -top-1 right-1.5 w-2 h-2 bg-gray-800 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm font-mono whitespace-pre-wrap relative group">
        {citationText}
      </div>
    </div>
  );
}
