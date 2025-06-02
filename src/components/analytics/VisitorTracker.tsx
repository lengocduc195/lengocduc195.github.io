'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { rtdb } from '@/lib/firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { getDetailedLocation, getDetailedTimeInfo, getLocalTimeInfo, LocationData, TimeInfo } from '@/lib/locationService';
import { useAuth } from '@/contexts/AuthContext';

// Define types for visitor data
interface VisitorData {
  // Session and user identification
  sessionId: string;
  userId?: string;
  userRole?: string;        // Role of the user: 'viewer', 'user', 'admin', etc.
  isAuthenticated?: boolean; // Whether the user is logged in

  // Basic page information
  timestamp: number;
  page: string;
  referrer: string;
  queryParams?: Record<string, string>;

  // Device information
  userAgent: string;
  language: string;
  languages?: string[];     // All preferred languages
  screenSize: {
    width: number;
    height: number;
    colorDepth?: number;
    pixelRatio?: number;
    orientation?: string;   // portrait or landscape
  };

  // Browser information
  browserInfo: {
    browser: string;
    version: string;
    os: string;
    osVersion?: string;
    mobile: boolean;
    deviceType?: string;    // desktop, mobile, tablet
    vendor?: string;        // Browser vendor
    platform?: string;      // Operating system platform
  };

  // Location information (enhanced)
  location?: LocationData;

  // Time information (enhanced)
  timeInfo?: TimeInfo;      // Detailed time information
  localTime?: string;       // Legacy format (for backward compatibility)

  // Connection information
  connectionInfo?: {
    effectiveType?: string; // 4g, 3g, 2g, slow-2g
    downlink?: number;      // Bandwidth estimate in Mbps
    rtt?: number;           // Round-trip time in ms
    saveData?: boolean;     // Whether data saver is enabled
  };

  // Additional tracking information
  entryPage?: boolean;      // Whether this is the first page in the session
  exitPage?: boolean;       // Whether this is the last page in the session
  landingSource?: string;   // Where the user came from (direct, search, social, etc.)
  utmParameters?: {         // UTM tracking parameters
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  // Hardware information
  hardwareInfo?: {
    deviceMemory?: number;  // Device memory in GB
    cpuCores?: number;      // Number of logical CPU cores
    batteryLevel?: number;  // Battery level (0-1)
    batteryCharging?: boolean; // Whether the device is charging
  };
}

interface PageViewData {
  // Session and user identification
  sessionId: string;
  userId?: string;
  userRole?: string;
  isAuthenticated?: boolean;

  // Page information
  page: string;
  pageTitle?: string;
  pageType?: string;        // e.g., 'home', 'product', 'category', 'article', etc.
  pageCategory?: string;    // e.g., 'electronics', 'clothing', etc.

  // Time information
  timestamp: number;
  timeSpent?: number;       // Time spent on page in seconds
  timeInfo?: TimeInfo;      // Detailed time information

  // Navigation information
  referrer?: string;
  referrerDomain?: string;
  entryPage?: boolean;      // Whether this is the first page in the session
  exitPage?: boolean;       // Whether this is the last page in the session
  previousPage?: string;    // The previous page in the session
  nextPage?: string;        // The next page in the session (if known)

  // Location information
  location?: {
    country?: string;
    countryCode?: string;
    region?: string;
    regionCode?: string;
    city?: string;
    district?: string;
    ward?: string;
    street?: string;
    postalCode?: string;
    formattedAddress?: string;
    timezone?: string;
    isp?: string;
    connectionType?: string;
  };

  // UTM parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;

  // Additional metadata
  queryParams?: Record<string, string>;
  deviceType?: string;      // 'desktop', 'mobile', 'tablet'
  browser?: string;
  os?: string;
}

interface InteractionData {
  // Session and user identification
  sessionId: string;
  userId?: string;
  userRole?: string;
  isAuthenticated?: boolean;

  // Page information
  page: string;
  pageTitle?: string;

  // Time information
  timestamp: number;
  timeFromPageLoad?: number; // Time in ms since page load

  // Interaction details
  type: 'click' | 'scroll' | 'hover' | 'form_submit' | 'button_click' | 'link_click' | 'video_play' | 'video_pause' | 'video_complete' | 'file_download' | 'copy' | 'search' | 'filter' | 'sort' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'purchase' | 'share' | 'login' | 'signup' | 'logout';
  target?: string;          // Element that was interacted with
  targetType?: string;      // Type of element (button, link, form, etc.)
  targetId?: string;        // ID of the element
  targetClass?: string;     // Class of the element
  targetText?: string;      // Text content of the element
  value?: string;           // Value associated with the interaction

  // Position information
  position?: {
    x: number;
    y: number;
    relativeX?: number;     // Position relative to viewport width (0-1)
    relativeY?: number;     // Position relative to viewport height (0-1)
    scrollDepth?: number;   // Scroll depth as percentage (0-100)
  };

  // Form data (for form submissions)
  formData?: {
    formId?: string;
    formName?: string;
    formFields?: string[];  // Names of fields in the form
    formAction?: string;    // Action URL of the form
    formMethod?: string;    // Method of the form (GET, POST)
  };

  // Additional context
  context?: string;         // Additional context about the interaction
  success?: boolean;        // Whether the interaction was successful
  errorMessage?: string;    // Error message if the interaction failed
}

// Helper function to detect detailed browser and device info
const detectBrowser = (): VisitorData['browserInfo'] => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';
  let osVersion = 'Unknown';
  let mobile = false;
  let deviceType = 'desktop';
  let vendor = navigator.vendor || 'Unknown';
  let platform = navigator.platform || 'Unknown';

  // Detect browser and version
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1 && userAgent.indexOf('OPR') === -1) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browser = 'Safari';
    version = userAgent.match(/Version\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Edg') > -1) {
    browser = 'Edge';
    version = userAgent.match(/Edg\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('OPR') > -1 || userAgent.indexOf('Opera') > -1) {
    browser = 'Opera';
    version = userAgent.match(/(?:OPR|Opera)[\s/]([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Trident') > -1 || userAgent.indexOf('MSIE') > -1) {
    browser = 'Internet Explorer';
    version = userAgent.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('UCBrowser') > -1) {
    browser = 'UC Browser';
    version = userAgent.match(/UCBrowser\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    browser = 'Samsung Browser';
    version = userAgent.match(/SamsungBrowser\/([\d.]+)/)?.[1] || 'Unknown';
  }

  // Detect OS and version
  if (userAgent.indexOf('Windows') > -1) {
    os = 'Windows';
    if (userAgent.indexOf('Windows NT 10.0') > -1) osVersion = '10';
    else if (userAgent.indexOf('Windows NT 6.3') > -1) osVersion = '8.1';
    else if (userAgent.indexOf('Windows NT 6.2') > -1) osVersion = '8';
    else if (userAgent.indexOf('Windows NT 6.1') > -1) osVersion = '7';
    else if (userAgent.indexOf('Windows NT 6.0') > -1) osVersion = 'Vista';
    else if (userAgent.indexOf('Windows NT 5.1') > -1) osVersion = 'XP';
    else if (userAgent.indexOf('Windows NT 5.0') > -1) osVersion = '2000';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'macOS';
    const macOSVersionMatch = userAgent.match(/Mac OS X (\d+[._]\d+[._\d]*)/);
    if (macOSVersionMatch) {
      osVersion = macOSVersionMatch[1].replace(/_/g, '.');
    }
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
    osVersion = userAgent.match(/Android ([\d.]+)/)?.[1] || 'Unknown';
    mobile = true;
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    os = 'iOS';
    const iOSVersionMatch = userAgent.match(/OS (\d+[._]\d+[._\d]*)/);
    if (iOSVersionMatch) {
      osVersion = iOSVersionMatch[1].replace(/_/g, '.');
    }
    mobile = true;
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
    // Try to detect specific Linux distributions
    if (userAgent.indexOf('Ubuntu') > -1) {
      osVersion = 'Ubuntu';
    } else if (userAgent.indexOf('Fedora') > -1) {
      osVersion = 'Fedora';
    } else if (userAgent.indexOf('Debian') > -1) {
      osVersion = 'Debian';
    }
  }

  // Detect device type
  if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'mobile';
      mobile = true;
    }
  }

  // Check if mobile based on screen size as well
  if (!mobile && typeof window !== 'undefined') {
    if (window.innerWidth <= 768) {
      mobile = true;
      deviceType = window.innerWidth <= 480 ? 'mobile' : 'tablet';
    }
  }

  return {
    browser,
    version,
    os,
    osVersion,
    mobile,
    deviceType,
    vendor,
    platform
  };
};

// Get or create a session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('visitor_session_id');

  // If no session ID exists or it's older than 30 minutes, create a new one
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('visitor_session_id', sessionId);
    localStorage.setItem('session_start_time', Date.now().toString());
  } else {
    const sessionStartTime = parseInt(localStorage.getItem('session_start_time') || '0', 10);
    const thirtyMinutesInMs = 30 * 60 * 1000;

    if (Date.now() - sessionStartTime > thirtyMinutesInMs) {
      sessionId = uuidv4();
      localStorage.setItem('visitor_session_id', sessionId);
      localStorage.setItem('session_start_time', Date.now().toString());
    }
  }

  return sessionId;
};

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser, userRole } = useAuth();
  const [sessionId, setSessionId] = useState<string>('');
  const [pageLoadTime, setPageLoadTime] = useState<number>(0);
  const [hasTrackedPageView, setHasTrackedPageView] = useState(false);

  // Initialize tracking on component mount
  useEffect(() => {
    if (typeof window === 'undefined' || !rtdb) return;

    // Check if user has given consent
    const hasConsent = localStorage.getItem('analytics_consent');
    if (hasConsent === 'false') {
      // User has explicitly declined consent
      return;
    }

    const newSessionId = getSessionId();
    setSessionId(newSessionId);
    setPageLoadTime(Date.now());
    setHasTrackedPageView(false);
  }, [pathname, searchParams]);

  // Track page view
  useEffect(() => {
    if (typeof window === 'undefined' || !rtdb || !sessionId || hasTrackedPageView) return;

    // Check if user has given consent
    const hasConsent = localStorage.getItem('analytics_consent');
    if (hasConsent === 'false') {
      // User has explicitly declined consent
      return;
    }

    const trackPageView = async () => {
      try {
        // Get detailed location data
        const locationData = await getDetailedLocation();

        // Get detailed time information
        const timeInfo = getDetailedTimeInfo();
        const localTime = timeInfo.formatted;

        // Get screen information
        const screenInfo = {
          width: window.innerWidth,
          height: window.innerHeight,
          colorDepth: window.screen.colorDepth,
          pixelRatio: window.devicePixelRatio,
          orientation: window.screen.orientation ?
            window.screen.orientation.type :
            window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        };

        // Get browser and device information
        const browserInfo = detectBrowser();

        // Get connection information
        let connectionInfo: Record<string, any> = {};
        try {
          // @ts-ignore - Navigator NetworkInformation API
          const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
          if (connection) {
            if (connection.effectiveType) connectionInfo.effectiveType = connection.effectiveType;
            if (connection.downlink !== undefined) connectionInfo.downlink = connection.downlink;
            if (connection.rtt !== undefined) connectionInfo.rtt = connection.rtt;
            if (connection.saveData !== undefined) connectionInfo.saveData = connection.saveData;
          }
        } catch (connectionError) {
          console.error('Error getting connection information:', connectionError);
        }

        // Get hardware information
        let hardwareInfo: Record<string, any> = {};
        try {
          // @ts-ignore - Navigator deviceMemory API
          const deviceMemory = navigator.deviceMemory;
          // @ts-ignore - Navigator hardwareConcurrency API
          const cpuCores = navigator.hardwareConcurrency;

          if (deviceMemory !== undefined) hardwareInfo.deviceMemory = deviceMemory;
          if (cpuCores !== undefined) hardwareInfo.cpuCores = cpuCores;

          // Try to get battery information if available
          if ('getBattery' in navigator) {
            try {
              // @ts-ignore - Navigator getBattery API
              const battery = await navigator.getBattery();
              if (battery) {
                if (battery.level !== undefined) hardwareInfo.batteryLevel = battery.level;
                if (battery.charging !== undefined) hardwareInfo.batteryCharging = battery.charging;
              }
            } catch (batteryError) {
              console.error('Error getting battery information:', batteryError);
            }
          }
        } catch (hardwareError) {
          console.error('Error getting hardware information:', hardwareError);
        }

        // Determine if this is an entry page
        const isEntryPage = !document.referrer ||
          !document.referrer.includes(window.location.hostname);

        // Extract UTM parameters
        const utmParameters: Record<string, string> = {};
        if (searchParams) {
          ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
            const value = searchParams.get(param);
            if (value) {
              utmParameters[param] = value;
            }
          });
        }

        // Determine landing source
        let landingSource = 'direct';
        if (document.referrer) {
          const referrerUrl = new URL(document.referrer);
          const referrerHostname = referrerUrl.hostname;

          if (referrerHostname.includes('google')) {
            landingSource = 'google';
          } else if (referrerHostname.includes('bing')) {
            landingSource = 'bing';
          } else if (referrerHostname.includes('yahoo')) {
            landingSource = 'yahoo';
          } else if (referrerHostname.includes('facebook') || referrerHostname.includes('fb.com')) {
            landingSource = 'facebook';
          } else if (referrerHostname.includes('instagram')) {
            landingSource = 'instagram';
          } else if (referrerHostname.includes('twitter') || referrerHostname.includes('t.co')) {
            landingSource = 'twitter';
          } else if (referrerHostname.includes('linkedin')) {
            landingSource = 'linkedin';
          } else if (referrerHostname.includes('youtube')) {
            landingSource = 'youtube';
          } else if (referrerHostname !== window.location.hostname) {
            landingSource = 'external';
          } else {
            landingSource = 'internal';
          }
        } else if (Object.keys(utmParameters).length > 0) {
          landingSource = utmParameters['utm_source'] || 'campaign';
        }

        // Get all languages
        const languages = navigator.languages ? Array.from(navigator.languages) : [navigator.language];

        // Get page title
        const pageTitle = document.title;

        // Determine page type based on URL pattern
        let pageType = 'other';
        if (pathname === '/' || pathname === '/home') {
          pageType = 'home';
        } else if (pathname.includes('/shop')) {
          pageType = 'shop';
        } else if (pathname.includes('/product')) {
          pageType = 'product';
        } else if (pathname.includes('/category')) {
          pageType = 'category';
        } else if (pathname.includes('/blog') || pathname.includes('/article')) {
          pageType = 'article';
        } else if (pathname.includes('/about')) {
          pageType = 'about';
        } else if (pathname.includes('/contact')) {
          pageType = 'contact';
        }

        // Collect comprehensive visitor data
        const visitorData: VisitorData = {
          // Session and user identification
          sessionId,
          ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
          userRole: userRole || 'viewer',
          isAuthenticated: !!currentUser,

          // Basic page information
          timestamp: Date.now(),
          page: pathname,
          referrer: document.referrer || '',
          queryParams: {},

          // Device information
          userAgent: navigator.userAgent,
          language: navigator.language,
          languages: languages,
          screenSize: screenInfo,

          // Browser information
          browserInfo: browserInfo,

          // Location information
          location: locationData,

          // Time information
          timeInfo: timeInfo,
          localTime: localTime,

          // Connection information
          ...(Object.keys(connectionInfo).length > 0 ? { connectionInfo } : {}),

          // Additional tracking information
          entryPage: isEntryPage,
          landingSource: landingSource,
          ...(Object.keys(utmParameters).length > 0 ? {
            utmParameters: {
              source: utmParameters['utm_source'] || null,
              medium: utmParameters['utm_medium'] || null,
              campaign: utmParameters['utm_campaign'] || null,
              term: utmParameters['utm_term'] || null,
              content: utmParameters['utm_content'] || null
            }
          } : {}),

          // Hardware information
          ...(hardwareInfo && Object.keys(hardwareInfo).length > 0 ? { hardwareInfo } : {})
        };

        // Add search params if they exist
        if (searchParams && searchParams.toString()) {
          const queryParamsObj: Record<string, string> = {};
          searchParams.forEach((value, key) => {
            queryParamsObj[key] = value;
          });
          visitorData.queryParams = queryParamsObj;
        }

        // Save comprehensive visitor data to Firebase Realtime Database
        const visitorRef = ref(rtdb, 'analytics/visitors');
        const newVisitorRef = push(visitorRef);
        await set(newVisitorRef, {
          ...visitorData,
          timestamp: serverTimestamp(),
        });

        // Track page view with enhanced data
        const pageViewRef = ref(rtdb, 'analytics/pageViews');
        const newPageViewRef = push(pageViewRef);
        await set(newPageViewRef, {
          // Session and user identification
          sessionId,
          ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
          userRole: userRole || 'viewer',
          isAuthenticated: !!currentUser,

          // Page information
          page: pathname,
          pageTitle: pageTitle,
          pageType: pageType,

          // Time information
          timestamp: serverTimestamp(),
          timeInfo: timeInfo,

          // Navigation information
          referrer: document.referrer || '',
          referrerDomain: document.referrer ? new URL(document.referrer).hostname : undefined,
          entryPage: isEntryPage,

          // Location information
          location: {
            country: locationData.country,
            countryCode: locationData.countryCode,
            region: locationData.region,
            regionCode: locationData.regionCode,
            city: locationData.city,
            district: locationData.district,
            ward: locationData.ward,
            street: locationData.street,
            postalCode: locationData.postalCode,
            formattedAddress: locationData.formattedAddress,
            timezone: locationData.timezone,
            isp: locationData.isp,
            connectionType: locationData.connectionType,
          },

          // UTM parameters
          ...(utmParameters['utm_source'] ? { utmSource: utmParameters['utm_source'] } : {}),
          ...(utmParameters['utm_medium'] ? { utmMedium: utmParameters['utm_medium'] } : {}),
          ...(utmParameters['utm_campaign'] ? { utmCampaign: utmParameters['utm_campaign'] } : {}),
          ...(utmParameters['utm_term'] ? { utmTerm: utmParameters['utm_term'] } : {}),
          ...(utmParameters['utm_content'] ? { utmContent: utmParameters['utm_content'] } : {}),

          // Additional metadata
          queryParams: visitorData.queryParams,
          deviceType: browserInfo.deviceType,
          browser: browserInfo.browser,
          os: browserInfo.os,
        });

        setHasTrackedPageView(true);
        console.log('Enhanced visitor and page view data saved to Firebase');
      } catch (error) {
        console.error('Error saving visitor data to Firebase:', error);
      }
    };

    trackPageView();
  }, [pathname, searchParams, sessionId, hasTrackedPageView]);

  // Track time spent on page with enhanced data
  useEffect(() => {
    if (typeof window === 'undefined' || !rtdb || !sessionId) return;

    // Check if user has given consent
    const hasConsent = localStorage.getItem('analytics_consent');
    if (hasConsent === 'false') {
      // User has explicitly declined consent
      return;
    }

    // Variables to track user activity
    let lastActivityTime = Date.now();
    let isUserActive = true;
    let totalActiveTime = 0;
    let totalInactiveTime = 0;
    let activityCheckInterval: NodeJS.Timeout | null = null;
    let periodicSaveInterval: NodeJS.Timeout | null = null;

    // Track user activity
    const updateActivity = () => {
      if (!isUserActive) {
        // User was inactive but is now active again
        const inactiveTime = Math.floor((Date.now() - lastActivityTime) / 1000);
        totalInactiveTime += inactiveTime;
      }

      lastActivityTime = Date.now();
      isUserActive = true;
    };

    // Check for inactivity every 5 seconds
    activityCheckInterval = setInterval(() => {
      const inactivityThreshold = 30000; // 30 seconds
      const timeSinceLastActivity = Date.now() - lastActivityTime;

      if (isUserActive && timeSinceLastActivity > inactivityThreshold) {
        // User has become inactive
        isUserActive = false;
      } else if (isUserActive) {
        // User is still active, increment active time
        totalActiveTime += 5; // 5 seconds since last check
      }
    }, 5000);

    // Save time spent data periodically (every 30 seconds)
    periodicSaveInterval = setInterval(async () => {
      if (!pageLoadTime) return;

      const totalTimeSpent = Math.floor((Date.now() - pageLoadTime) / 1000); // in seconds

      if (totalTimeSpent > 5) { // Only save if more than 5 seconds have passed
        try {
          // Get detailed time information
          const timeInfo = getDetailedTimeInfo();

          const timeSpentRef = ref(rtdb, 'analytics/timeSpent');
          const newTimeSpentRef = push(timeSpentRef);
          await set(newTimeSpentRef, {
            // Session and user identification
            sessionId,
            ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
            userRole: userRole || 'viewer',
            isAuthenticated: !!currentUser,

            // Page information
            page: pathname,
            pageTitle: document.title,

            // Time information
            timestamp: serverTimestamp(),
            timeInfo: timeInfo,
            timeSpent: totalTimeSpent,
            activeTime: totalActiveTime,
            inactiveTime: totalInactiveTime,

            // Activity information
            isActive: isUserActive,
            periodicUpdate: true,

            // Additional metadata
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
          });
        } catch (error) {
          console.error('Error saving periodic time spent data:', error);
        }
      }
    }, 30000);

    // Handle page unload
    const handleBeforeUnload = async () => {
      if (!pageLoadTime) return;

      const totalTimeSpent = Math.floor((Date.now() - pageLoadTime) / 1000); // in seconds

      // Update active/inactive time one last time
      if (isUserActive) {
        const activeTime = Math.floor((Date.now() - lastActivityTime) / 1000);
        totalActiveTime += activeTime;
      } else {
        const inactiveTime = Math.floor((Date.now() - lastActivityTime) / 1000);
        totalInactiveTime += inactiveTime;
      }

      if (totalTimeSpent > 1) {
        try {
          // Get detailed time information
          const timeInfo = getDetailedTimeInfo();

          const timeSpentRef = ref(rtdb, 'analytics/timeSpent');
          const newTimeSpentRef = push(timeSpentRef);
          await set(newTimeSpentRef, {
            // Session and user identification
            sessionId,
            ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
            userRole: userRole || 'viewer',
            isAuthenticated: !!currentUser,

            // Page information
            page: pathname,
            pageTitle: document.title,

            // Time information
            timestamp: serverTimestamp(),
            timeInfo: timeInfo,
            timeSpent: totalTimeSpent,
            activeTime: totalActiveTime,
            inactiveTime: totalInactiveTime,

            // Activity information
            isActive: isUserActive,
            exitPage: true,

            // Additional metadata
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            scrollDepth: calculateScrollDepth()
          });
        } catch (error) {
          console.error('Error saving final time spent data:', error);
        }
      }
    };

    // Calculate current scroll depth
    const calculateScrollDepth = (): number => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      return scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    };

    // Add event listeners for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Remove all event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Clear intervals
      if (activityCheckInterval) clearInterval(activityCheckInterval);
      if (periodicSaveInterval) clearInterval(periodicSaveInterval);

      // Save final time spent data
      handleBeforeUnload();
    };
  }, [pathname, sessionId, pageLoadTime, currentUser, userRole]);

  // Track user interactions
  useEffect(() => {
    if (typeof window === 'undefined' || !rtdb || !sessionId) return;

    // Check if user has given consent
    const hasConsent = localStorage.getItem('analytics_consent');
    if (hasConsent === 'false') {
      // User has explicitly declined consent
      return;
    }

    const trackInteraction = async (
      type: InteractionData['type'],
      target?: string,
      value?: string,
      position?: { x: number; y: number },
      additionalData?: Partial<InteractionData>
    ) => {
      try {
        // Get page title
        const pageTitle = document.title;

        // Calculate time from page load
        const timeFromPageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;

        // Calculate relative position if absolute position is provided
        let enhancedPosition = position;
        if (position) {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

          enhancedPosition = {
            ...position,
            relativeX: viewportWidth > 0 ? position.x / viewportWidth : undefined,
            relativeY: viewportHeight > 0 ? position.y / viewportHeight : undefined,
            scrollDepth: scrollDepth
          };
        }

        // Create comprehensive interaction data
        const interactionData: InteractionData = {
          // Session and user identification
          sessionId,
          ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
          userRole: userRole || 'viewer',
          isAuthenticated: !!currentUser,

          // Page information
          page: pathname,
          pageTitle: pageTitle,

          // Time information
          timestamp: Date.now(),
          timeFromPageLoad: timeFromPageLoad,

          // Interaction details
          type: type,
          target: target,
          value: value,
          position: enhancedPosition,

          // Add any additional data provided
          ...additionalData
        };

        // Save to Firebase Realtime Database
        const interactionRef = ref(rtdb, 'analytics/interactions');
        const newInteractionRef = push(interactionRef);
        await set(newInteractionRef, {
          ...interactionData,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving interaction data:', error);
      }
    };

    // Track clicks with enhanced information
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Get detailed target information
      const targetId = target.id || '';
      const targetClass = target.className || '';
      const targetType = target.tagName.toLowerCase();
      const targetText = target.textContent?.trim().slice(0, 100) || '';

      // Create a CSS-like selector for the target
      const targetInfo = target.tagName + (targetId ? `#${targetId}` : '') + (targetClass ? `.${targetClass.replace(/\s+/g, '.')}` : '');

      // Determine if this is a link, button, or other interactive element
      let interactionType: InteractionData['type'] = 'click';
      let additionalData: Partial<InteractionData> = {
        targetId,
        targetClass,
        targetType,
        targetText
      };

      // Check if the click is on a link
      const closestLink = target.closest('a');
      if (closestLink) {
        interactionType = 'link_click';
        additionalData.value = closestLink.href || '';
        additionalData.target = `a${closestLink.id ? `#${closestLink.id}` : ''}`;
        additionalData.targetText = closestLink.textContent?.trim().slice(0, 100) || '';
      }

      // Check if the click is on a button
      const closestButton = target.closest('button');
      if (closestButton) {
        interactionType = 'button_click';
        additionalData.target = `button${closestButton.id ? `#${closestButton.id}` : ''}`;
        additionalData.targetText = closestButton.textContent?.trim().slice(0, 100) || '';
      }

      // Track the interaction with enhanced data
      trackInteraction(
        interactionType,
        targetInfo,
        targetText,
        { x: e.clientX, y: e.clientY },
        additionalData
      );
    };

    // Track scroll depth with enhanced information
    let lastScrollDepth = 0;
    let scrollStartTime = Date.now();
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);
      const scrollDuration = Date.now() - scrollStartTime;

      // Only track when scroll depth changes by at least 25% or reaches 100%
      if (scrollDepth >= lastScrollDepth + 25 || scrollDepth === 100) {
        // Calculate scroll speed (pixels per second)
        const scrollSpeed = scrollDuration > 0 ? Math.round((scrollTop - (lastScrollDepth / 100 * scrollHeight)) / (scrollDuration / 1000)) : 0;

        // Track the scroll interaction with enhanced data
        trackInteraction(
          'scroll',
          'window',
          `${scrollDepth}%`,
          undefined,
          {
            position: {
              scrollDepth: scrollDepth
            },
            value: `${scrollDepth}%`,
            context: `Scroll speed: ${scrollSpeed}px/s, Duration: ${Math.round(scrollDuration / 1000)}s`
          }
        );

        lastScrollDepth = scrollDepth;
        scrollStartTime = Date.now();
      }
    };

    // Track form submissions with enhanced information
    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formId = form.id || '';
      const formName = form.name || '';
      const formAction = form.action || '';
      const formMethod = form.method || '';

      // Collect form field names (but not values for privacy)
      const formFields = Array.from(form.elements)
        .filter(el => (el as HTMLElement).tagName !== 'BUTTON')
        .map(el => {
          const element = el as HTMLInputElement;
          return element.name || element.id || element.type;
        })
        .filter(Boolean);

      // Track the form submission with enhanced data
      trackInteraction(
        'form_submit',
        `form${formId ? `#${formId}` : ''}`,
        formAction,
        undefined,
        {
          formData: {
            formId,
            formName,
            formFields,
            formAction,
            formMethod
          }
        }
      );
    };

    // Track video interactions
    const handleVideoInteraction = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const videoId = video.id || '';
      const videoSrc = video.currentSrc || '';
      const videoDuration = video.duration || 0;
      const videoCurrentTime = video.currentTime || 0;
      const videoPercentage = videoDuration > 0 ? Math.round((videoCurrentTime / videoDuration) * 100) : 0;

      let interactionType: InteractionData['type'];
      if (e.type === 'play') {
        interactionType = 'video_play';
      } else if (e.type === 'pause') {
        interactionType = 'video_pause';
      } else if (e.type === 'ended') {
        interactionType = 'video_complete';
      } else {
        return; // Ignore other events
      }

      trackInteraction(
        interactionType,
        `video${videoId ? `#${videoId}` : ''}`,
        videoSrc,
        undefined,
        {
          value: `${videoPercentage}%`,
          context: `Duration: ${Math.round(videoDuration)}s, Current time: ${Math.round(videoCurrentTime)}s`
        }
      );
    };

    // Track file downloads
    const handleFileDownload = (e: MouseEvent) => {
      const link = e.currentTarget as HTMLAnchorElement;
      const href = link.href || '';
      const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif'];

      // Check if this is a file download link
      const isFileDownload = fileExtensions.some(ext => href.toLowerCase().endsWith(ext));
      if (isFileDownload) {
        trackInteraction(
          'file_download',
          `a${link.id ? `#${link.id}` : ''}`,
          href,
          { x: e.clientX, y: e.clientY },
          {
            targetText: link.textContent?.trim().slice(0, 100) || '',
            value: href.split('/').pop() || href // Get filename
          }
        );
      }
    };

    // Track search interactions
    const handleSearch = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const searchInput = form.querySelector('input[type="search"], input[name="q"], input[name="query"], input[name="search"]') as HTMLInputElement;

      if (searchInput && searchInput.value) {
        trackInteraction(
          'search',
          `form${form.id ? `#${form.id}` : ''}`,
          searchInput.value,
          undefined,
          {
            formData: {
              formId: form.id || '',
              formName: form.name || '',
              formAction: form.action || '',
              formMethod: form.method || ''
            }
          }
        );
      }
    };

    // Track copy events
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString().trim();
      if (selection && selection.length > 0) {
        trackInteraction(
          'copy',
          'document',
          selection.length > 100 ? `${selection.substring(0, 100)}...` : selection,
          undefined,
          {
            context: `Length: ${selection.length} characters`
          }
        );
      }
    };

    // Track hover events (debounced to avoid excessive tracking)
    let hoverTimeout: NodeJS.Timeout | null = null;
    let lastHoveredElement: HTMLElement | null = null;

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only track hover on interactive elements
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') ||
        target.closest('button')
      ) {
        // Clear previous timeout
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }

        // Only track if hovering over a new element
        if (target !== lastHoveredElement) {
          lastHoveredElement = target;

          // Set a timeout to track hover after 1 second
          hoverTimeout = setTimeout(() => {
            const targetId = target.id || '';
            const targetClass = target.className || '';
            const targetType = target.tagName.toLowerCase();
            const targetText = target.textContent?.trim().slice(0, 100) || '';

            trackInteraction(
              'hover',
              target.tagName + (targetId ? `#${targetId}` : '') + (targetClass ? `.${targetClass.replace(/\s+/g, '.')}` : ''),
              targetText,
              { x: e.clientX, y: e.clientY },
              {
                targetId,
                targetClass,
                targetType,
                targetText
              }
            );
          }, 1000);
        }
      }
    };

    // Track mouse leave to clear hover tracking
    const handleMouseLeave = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      lastHoveredElement = null;
    };

    // Add event listeners for all tracked interactions
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('mousemove', handleHover);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('copy', handleCopy);

    // Track form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', handleSubmit);

      // Check if this is a search form
      const isSearchForm =
        form.querySelector('input[type="search"]') !== null ||
        form.querySelector('input[name="q"]') !== null ||
        form.querySelector('input[name="query"]') !== null ||
        form.querySelector('input[name="search"]') !== null;

      if (isSearchForm) {
        form.addEventListener('submit', handleSearch);
      }
    });

    // Track video interactions
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.addEventListener('play', handleVideoInteraction);
      video.addEventListener('pause', handleVideoInteraction);
      video.addEventListener('ended', handleVideoInteraction);
    });

    // Track file downloads
    const downloadLinks = document.querySelectorAll('a[href]');
    downloadLinks.forEach(link => {
      const href = (link as HTMLAnchorElement).href || '';
      const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif'];

      // Check if this is a file download link
      const isFileDownload = fileExtensions.some(ext => href.toLowerCase().endsWith(ext));
      if (isFileDownload) {
        link.addEventListener('click', handleFileDownload as EventListener);
      }
    });

    return () => {
      // Remove all event listeners
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleHover);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('copy', handleCopy);

      // Clean up form event listeners
      forms.forEach(form => {
        form.removeEventListener('submit', handleSubmit);

        const isSearchForm =
          form.querySelector('input[type="search"]') !== null ||
          form.querySelector('input[name="q"]') !== null ||
          form.querySelector('input[name="query"]') !== null ||
          form.querySelector('input[name="search"]') !== null;

        if (isSearchForm) {
          form.removeEventListener('submit', handleSearch);
        }
      });

      // Clean up video event listeners
      videos.forEach(video => {
        video.removeEventListener('play', handleVideoInteraction);
        video.removeEventListener('pause', handleVideoInteraction);
        video.removeEventListener('ended', handleVideoInteraction);
      });

      // Clean up download link event listeners
      downloadLinks.forEach(link => {
        const href = (link as HTMLAnchorElement).href || '';
        const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif'];

        const isFileDownload = fileExtensions.some(ext => href.toLowerCase().endsWith(ext));
        if (isFileDownload) {
          link.removeEventListener('click', handleFileDownload as EventListener);
        }
      });

      // Track time spent before leaving the page
      if (pageLoadTime) {
        const timeSpent = Math.floor((Date.now() - pageLoadTime) / 1000); // in seconds

        if (timeSpent > 1 && rtdb) {
          try {
            const timeSpentRef = ref(rtdb, 'analytics/timeSpent');
            const newTimeSpentRef = push(timeSpentRef);
            set(newTimeSpentRef, {
              sessionId,
              ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
              userRole: userRole || 'viewer',
              isAuthenticated: !!currentUser,
              page: pathname,
              pageTitle: document.title,
              timeSpent,
              timestamp: serverTimestamp(),
              exitPage: true
            });
          } catch (error) {
            console.error('Error saving final time spent data:', error);
          }
        }
      }

      // Clear any pending timeouts
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [pathname, sessionId]);

  // This component doesn't render anything visible
  return null;
}
