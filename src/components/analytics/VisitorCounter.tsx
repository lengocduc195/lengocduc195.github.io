'use client';

import { useState, useEffect } from 'react';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, startAt, endAt } from 'firebase/database';

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!rtdb) return;

    // Check if user has given consent
    const hasConsent = localStorage.getItem('analytics_consent');
    if (hasConsent === 'false') {
      // User has explicitly declined consent
      setLoading(false);
      return;
    }

    // Get current timestamp
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Convert to timestamps
    const startTimestamp = thirtyMinutesAgo.getTime();
    const endTimestamp = now.getTime();

    // Create a query to get visitors from the last 30 minutes
    const visitorsRef = ref(rtdb, 'analytics/visitors');

    // Set up real-time listener
    const unsubscribe = onValue(visitorsRef, (snapshot) => {
      if (snapshot.exists()) {
        // Count unique session IDs in the last 30 minutes
        const sessions = new Set();
        let count = 0;

        snapshot.forEach((childSnapshot) => {
          const visitor = childSnapshot.val();
          if (visitor.timestamp && visitor.timestamp >= startTimestamp && visitor.timestamp <= endTimestamp) {
            if (!sessions.has(visitor.sessionId)) {
              sessions.add(visitor.sessionId);
              count++;
            }
          }
        });

        setVisitorCount(count);
      } else {
        setVisitorCount(0);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-400">Loading visitors...</div>;
  }

  return (
    <div className="text-sm text-gray-400">
      {visitorCount} active {visitorCount === 1 ? 'visitor' : 'visitors'} in the last 30 minutes
    </div>
  );
}
