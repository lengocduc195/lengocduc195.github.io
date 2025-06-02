'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function FirebaseConfigCheck() {
  const [showMessage, setShowMessage] = useState(false);
  const { firebaseInitialized } = useAuth();

  useEffect(() => {
    // Check if Firebase is properly configured
    const isFirebaseConfigured = typeof auth !== 'undefined' && firebaseInitialized;
    setShowMessage(!isFirebaseConfigured);

    // The hiding of Firebase messages is now handled by the script in layout.tsx
    // This component now only tracks the Firebase initialization state

  }, [firebaseInitialized]);

  // This component doesn't render anything visible
  return null;
}
