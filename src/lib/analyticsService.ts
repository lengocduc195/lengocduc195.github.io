import { rtdb } from '@/lib/firebase';
import { ref, push, set, get, query, orderByChild, limitToLast, serverTimestamp } from 'firebase/database';

// Types for analytics data
export interface VisitorData {
  sessionId: string;
  userId?: string;
  timestamp: number | null;
  page: string;
  referrer: string;
  userAgent: string;
  language: string;
  screenSize: {
    width: number;
    height: number;
  };
  browserInfo: {
    browser: string;
    version: string;
    os: string;
    mobile: boolean;
  };
  queryParams?: Record<string, string>;
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    ip?: string;
  };
  localTime?: string;
}

export interface PageViewData {
  sessionId: string;
  userId?: string;
  page: string;
  timestamp: number | null;
  timeSpent?: number;
  referrer?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  localTime?: string;
}

export interface InteractionData {
  sessionId: string;
  userId?: string;
  page: string;
  timestamp: number | null;
  type: 'click' | 'scroll' | 'hover' | 'form_submit' | 'button_click';
  target?: string;
  value?: string;
  position?: { x: number; y: number };
}

export interface TimeSpentData {
  sessionId: string;
  userId?: string;
  page: string;
  timestamp: number | null;
  timeSpent: number;
}

// Save visitor data to Firebase
export const saveVisitorData = async (data: VisitorData): Promise<string | null> => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return null;
  }

  try {
    const visitorRef = ref(rtdb, 'analytics/visitors');
    const newVisitorRef = push(visitorRef);
    await set(newVisitorRef, {
      ...data,
      timestamp: serverTimestamp(),
    });
    return newVisitorRef.key;
  } catch (error) {
    console.error('Error saving visitor data:', error);
    return null;
  }
};

// Save page view data to Firebase
export const savePageViewData = async (data: PageViewData): Promise<string | null> => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return null;
  }

  try {
    const pageViewRef = ref(rtdb, 'analytics/pageViews');
    const newPageViewRef = push(pageViewRef);
    await set(newPageViewRef, {
      ...data,
      timestamp: serverTimestamp(),
    });
    return newPageViewRef.key;
  } catch (error) {
    console.error('Error saving page view data:', error);
    return null;
  }
};

// Save interaction data to Firebase
export const saveInteractionData = async (data: InteractionData): Promise<string | null> => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return null;
  }

  try {
    const interactionRef = ref(rtdb, 'analytics/interactions');
    const newInteractionRef = push(interactionRef);
    await set(newInteractionRef, {
      ...data,
      timestamp: serverTimestamp(),
    });
    return newInteractionRef.key;
  } catch (error) {
    console.error('Error saving interaction data:', error);
    return null;
  }
};

// Save time spent data to Firebase
export const saveTimeSpentData = async (data: TimeSpentData): Promise<string | null> => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return null;
  }

  try {
    const timeSpentRef = ref(rtdb, 'analytics/timeSpent');
    const newTimeSpentRef = push(timeSpentRef);
    await set(newTimeSpentRef, {
      ...data,
      timestamp: serverTimestamp(),
    });
    return newTimeSpentRef.key;
  } catch (error) {
    console.error('Error saving time spent data:', error);
    return null;
  }
};

// Get recent visitors (last 100)
export const getRecentVisitors = async (limit: number = 100): Promise<VisitorData[]> => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return [];
  }

  try {
    const visitorsRef = ref(rtdb, 'analytics/visitors');
    const visitorsQuery = query(visitorsRef, orderByChild('timestamp'), limitToLast(limit));
    const snapshot = await get(visitorsQuery);

    if (snapshot.exists()) {
      const visitors: VisitorData[] = [];
      snapshot.forEach((childSnapshot) => {
        visitors.push({
          ...childSnapshot.val(),
          id: childSnapshot.key,
        } as VisitorData);
      });
      return visitors.reverse(); // Most recent first
    }

    return [];
  } catch (error) {
    console.error('Error getting recent visitors:', error);
    return [];
  }
};

// Get page views for a specific page
export const getPageViews = async (page: string): Promise<PageViewData[]> => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return [];
  }

  try {
    const pageViewsRef = ref(rtdb, 'analytics/pageViews');
    const snapshot = await get(pageViewsRef);

    if (snapshot.exists()) {
      const pageViews: PageViewData[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val() as PageViewData;
        if (data.page === page) {
          pageViews.push({
            ...data,
            id: childSnapshot.key,
          });
        }
      });
      return pageViews;
    }

    return [];
  } catch (error) {
    console.error('Error getting page views:', error);
    return [];
  }
};

// Get interactions for a specific session
export const getSessionInteractions = async (sessionId: string): Promise<InteractionData[]> => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return [];
  }

  try {
    const interactionsRef = ref(rtdb, 'analytics/interactions');
    const snapshot = await get(interactionsRef);

    if (snapshot.exists()) {
      const interactions: InteractionData[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val() as InteractionData;
        if (data.sessionId === sessionId) {
          interactions.push({
            ...data,
            id: childSnapshot.key,
          });
        }
      });
      return interactions;
    }

    return [];
  } catch (error) {
    console.error('Error getting session interactions:', error);
    return [];
  }
};

// Get average time spent on a specific page
export const getAverageTimeSpent = async (page: string): Promise<number> => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return 0;
  }

  try {
    const timeSpentRef = ref(rtdb, 'analytics/timeSpent');
    const snapshot = await get(timeSpentRef);

    if (snapshot.exists()) {
      let totalTime = 0;
      let count = 0;

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val() as TimeSpentData;
        if (data.page === page && data.timeSpent) {
          totalTime += data.timeSpent;
          count++;
        }
      });

      return count > 0 ? Math.round(totalTime / count) : 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting average time spent:', error);
    return 0;
  }
};
