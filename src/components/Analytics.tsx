"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsData {
  page: string;
  referrer: string;
  timeSpent: number;
  interests: string[];
  timestamp: number;
  sessionId: string;
}

export default function Analytics() {
  const pathname = usePathname();
  // const searchParams = useSearchParams();
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionId, setSessionId] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);

  // Generate or retrieve session ID
  useEffect(() => {
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Function to save analytics data to localStorage
  const saveAnalyticsToLocalStorage = (type: string, data: any) => {
    try {
      if (typeof window === 'undefined') return;

      // Get existing data from localStorage
      const existingData = localStorage.getItem(`analytics_${type}`) || '[]';
      const parsedData = JSON.parse(existingData);

      // Add new data
      parsedData.push({
        ...data,
        timestamp: Date.now()
      });

      // Save back to localStorage
      localStorage.setItem(`analytics_${type}`, JSON.stringify(parsedData));
    } catch (error) {
      console.error(`Failed to save ${type} data to localStorage:`, error);
    }
  };

  // Track page view on mount
  useEffect(() => {
    if (!sessionId || typeof window === 'undefined') return;

    // Reset start time when page changes
    setStartTime(Date.now());

    // Send page view data
    const pageViewData = {
      page: pathname,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId,
    };

    // Save to localStorage
    saveAnalyticsToLocalStorage('pageview', pageViewData);

    // Cleanup function to track time spent
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // in seconds

      if (timeSpent > 1) { // Only track if spent more than 1 second
        const analyticsData: AnalyticsData = {
          page: pathname,
          referrer: document.referrer,
          timeSpent,
          interests,
          timestamp: Date.now(),
          sessionId,
        };

        // Save to localStorage
        saveAnalyticsToLocalStorage('timespent', analyticsData);
      }
    };
  }, [pathname, sessionId, startTime, interests]);

  // Track user interests based on scroll depth and clicks
  useEffect(() => {
    if (!sessionId) return;

    const handleScroll = () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);

      // If user scrolls more than 70% of the page, they're interested
      if (scrollDepth > 70) {
        const pageType = pathname.split('/')[1] || 'home';
        if (!interests.includes(pageType)) {
          setInterests(prev => [...prev, pageType]);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickedElement = target.closest('a, button, .clickable');

      if (clickedElement) {
        const dataInterest = clickedElement.getAttribute('data-interest');
        if (dataInterest && !interests.includes(dataInterest)) {
          setInterests(prev => [...prev, dataInterest]);
        }
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
    };
  }, [pathname, sessionId, interests]);

  // Invisible component
  return null;
}
