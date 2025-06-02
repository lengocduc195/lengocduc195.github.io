'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminPage() {
  const { currentUser } = useAuth();
  const { isAdmin, adminLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if logged in as admin
    if (!adminLoading) {
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else if (currentUser) {
        // If logged in but not admin, redirect to login
        router.push('/admin/login');
      } else {
        // If not logged in, redirect to login
        router.push('/admin/login');
      }
    }
  }, [currentUser, isAdmin, adminLoading, router]);

  // This page is just a redirect, so we don't need to render anything
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Redirecting...</h1>
      <p>Please wait while we redirect you to the admin dashboard.</p>
    </div>
  );
}
