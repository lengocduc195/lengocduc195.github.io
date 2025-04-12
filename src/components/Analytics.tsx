"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
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

  // Track page view on mount
  useEffect(() => {
    if (!sessionId) return;

    // Reset start time when page changes
    setStartTime(Date.now());

    // Send page view data
    const pageViewData = {
      page: pathname,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId,
    };

    // Send to API
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pageViewData),
    }).catch(err => console.error('Failed to send page view data:', err));

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

        // Send to API
        fetch('/api/analytics/timespent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(analyticsData),
        }).catch(err => console.error('Failed to send time spent data:', err));
      }
    };
  }, [pathname, sessionId, searchParams]);

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
