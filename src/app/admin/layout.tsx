'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in (except for login page)
  useEffect(() => {
    const pathname = window.location.pathname;
    if (!loading && !currentUser && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <p>You must be logged in to access this page.</p>
      </div>
    );
  }

  // Special case for login page - don't show sidebar
  const isLoginPage = router.pathname === '/admin/login';

  return (
    <AdminProvider>
      {isLoginPage ? (
        <div className="pt-16">
          {children}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-900 p-4">
            <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link href="/admin/analytics-dashboard" className="block p-2 hover:bg-gray-800 rounded">
                    Analytics Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/orders" className="block p-2 hover:bg-gray-800 rounded">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link href="/admin/products" className="block p-2 hover:bg-gray-800 rounded">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users" className="block p-2 hover:bg-gray-800 rounded">
                    Users
                  </Link>
                </li>
                <li>
                  <Link href="/admin/create-admin" className="block p-2 hover:bg-gray-800 rounded">
                    Create Admin
                  </Link>
                </li>
                <li className="border-t border-gray-700 pt-2 mt-2">
                  <Link href="/" className="block p-2 hover:bg-gray-800 rounded">
                    Back to Site
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 pt-20">
            {children}
          </div>
        </div>
      )}
    </AdminProvider>
  );
}
