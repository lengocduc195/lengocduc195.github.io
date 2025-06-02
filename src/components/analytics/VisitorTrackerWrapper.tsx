'use client';

import { ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';

// Dynamically import the VisitorTracker component to ensure it only loads on the client
const VisitorTracker = dynamic(() => import('./VisitorTracker'), {
  ssr: false,
});

// Dynamically import the ConsentBanner component
const ConsentBanner = dynamic(() => import('./ConsentBanner'), {
  ssr: false,
});

interface VisitorTrackerWrapperProps {
  children: ReactNode;
}

export default function VisitorTrackerWrapper({ children }: VisitorTrackerWrapperProps) {
  const { firebaseInitialized } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {children}
      {isClient && <ConsentBanner />}
      {isClient && firebaseInitialized && <VisitorTracker />}
    </>
  );
}
