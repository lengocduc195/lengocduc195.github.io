'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, db, rtdb, getUserProfile, getUserProfileRTDB, getUserRole, getUserData } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  userData: any | null;
  userRole: string;
  loading: boolean;
  firebaseInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  userData: null,
  userRole: 'guest',
  loading: true,
  firebaseInitialized: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string>('guest');
  const [loading, setLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(Boolean(auth));

  useEffect(() => {
    // Set a timeout to prevent infinite loading if Firebase fails to initialize
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Firebase initialization timed out, continuing without Firebase');
        setLoading(false);
      }
    }, 3000); // 3 seconds timeout

    let unsubscribe = () => {};

    // Only set up auth state listener if auth is initialized
    if (auth) {
      setFirebaseInitialized(true);

      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setCurrentUser(user);

          if (user) {
            try {
              // First try to get profile from Realtime Database
              let profile = null;

              if (rtdb) {
                try {
                  profile = await getUserProfileRTDB(user.uid);
                } catch (rtdbError) {
                  console.error('Error fetching from Realtime Database:', rtdbError);
                }
              }

              // If not found in RTDB or RTDB not available, try Firestore as fallback
              if (!profile && db) {
                try {
                  profile = await getUserProfile(user.uid);

                  // If profile exists in Firestore but not in RTDB, we could migrate it
                  if (profile && rtdb) {
                    console.log('Profile found in Firestore but not in RTDB. Consider migrating data.');
                  }
                } catch (firestoreError) {
                  console.error('Error fetching from Firestore:', firestoreError);
                }
              }

              setUserProfile(profile);

              // Get user data from Realtime Database
              if (rtdb) {
                try {
                  // Get user data
                  const data = await getUserData(user.uid);
                  setUserData(data);

                  // Get user role
                  const role = await getUserRole(user.uid);
                  setUserRole(role);

                  console.log(`User role: ${role}`);
                } catch (userDataError) {
                  console.error('Error fetching user data:', userDataError);
                  setUserRole('user'); // Default to 'user' role if error
                }
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          } else {
            setUserProfile(null);
            setUserData(null);
            setUserRole('guest');
          }

          setLoading(false);
          clearTimeout(timeoutId);
        });
      } catch (authError) {
        console.error('Error setting up auth state listener:', authError);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    } else {
      // If auth is not initialized, just set loading to false
      console.log('Firebase Auth not initialized, continuing without authentication');
      setLoading(false);
      clearTimeout(timeoutId);
    }

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    userData,
    userRole,
    loading,
    firebaseInitialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
