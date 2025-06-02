'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { auth, checkIsAdmin } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from './AuthContext';
import { canAccessAdmin } from '@/lib/permissions';

interface AdminContextType {
  isAdmin: boolean;
  adminLoading: boolean;
  adminUser: User | null;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  adminLoading: true,
  adminUser: null,
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading, userRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (loading) {
        return; // Wait for auth to initialize
      }

      if (!currentUser) {
        setIsAdmin(false);
        setAdminUser(null);
        setAdminLoading(false);
        return;
      }

      try {
        // Check if user has admin role
        const hasAdminAccess = canAccessAdmin(userRole);

        // Double-check with the admin collection for backward compatibility
        let adminStatus = hasAdminAccess;

        if (!adminStatus) {
          adminStatus = await checkIsAdmin(currentUser.uid);
        }

        setIsAdmin(adminStatus);
        setAdminUser(adminStatus ? currentUser : null);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminUser(null);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, loading, userRole]);

  const value = {
    isAdmin,
    adminLoading,
    adminUser,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Higher-order component to protect admin routes
export const withAdminProtection = (Component: React.ComponentType) => {
  return function ProtectedRoute(props: any) {
    const { isAdmin, adminLoading } = useAdmin();
    const router = useRouter();

    useEffect(() => {
      if (!adminLoading && !isAdmin) {
        router.push('/admin/login');
      }
    }, [isAdmin, adminLoading, router]);

    if (adminLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Checking admin credentials...</h2>
            <p className="text-gray-400">Please wait while we verify your access.</p>
          </div>
        </div>
      );
    }

    if (!isAdmin) {
      return null; // Will redirect in the useEffect
    }

    return <Component {...props} />;
  };
};
