'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { withAdminProtection } from '@/contexts/AdminContext';
import { rtdb } from '@/lib/firebase';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';

interface DashboardStats {
  totalVisitors: number;
  totalPageViews: number;
  uniqueVisitors: number;
  countries: number;
  cities: number;
  totalUsers: number;
  registeredUsers: number;
  anonymousVisitors: number;
  usersByRole: Record<string, number>;
  topPages: Record<string, number>;
  topCountries: Record<string, number>;
  topCities: Record<string, number>;
  recentVisitors: any[];
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    totalPageViews: 0,
    uniqueVisitors: 0,
    countries: 0,
    cities: 0,
    totalUsers: 0,
    registeredUsers: 0,
    anonymousVisitors: 0,
    usersByRole: {},
    topPages: {},
    topCountries: {},
    topCities: {},
    recentVisitors: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!rtdb) {
        setError('Firebase Realtime Database is not initialized');
        setLoading(false);
        return;
      }

      try {
        // Get visitors data
        const visitorsRef = ref(rtdb, 'analytics/visitors');
        const visitorsQuery = query(visitorsRef, orderByChild('timestamp'), limitToLast(1000));
        const visitorsSnapshot = await get(visitorsQuery);

        // Get page views data
        const pageViewsRef = ref(rtdb, 'analytics/pageViews');
        const pageViewsQuery = query(pageViewsRef, orderByChild('timestamp'), limitToLast(1000));
        const pageViewsSnapshot = await get(pageViewsQuery);

        // Get users data
        const usersRef = ref(rtdb, 'users');
        const usersSnapshot = await get(usersRef);

        if (!visitorsSnapshot.exists()) {
          setStats({
            totalVisitors: 0,
            totalPageViews: 0,
            uniqueVisitors: 0,
            countries: 0,
            cities: 0,
            totalUsers: 0,
            registeredUsers: 0,
            anonymousVisitors: 0,
            usersByRole: {},
            topPages: {},
            topCountries: {},
            topCities: {},
            recentVisitors: [],
          });
          setLoading(false);
          return;
        }

        // Process data
        const visitors: any[] = [];
        const sessionIds = new Set<string>();
        const countries = new Set<string>();
        const cities = new Set<string>();
        const pageViews: Record<string, number> = {};
        const countryViews: Record<string, number> = {};
        const cityViews: Record<string, number> = {};

        // Get time threshold based on selected range
        const now = Date.now();
        let timeThreshold = 0;

        switch (timeRange) {
          case 'day':
            timeThreshold = now - 24 * 60 * 60 * 1000; // 1 day
            break;
          case 'week':
            timeThreshold = now - 7 * 24 * 60 * 60 * 1000; // 7 days
            break;
          case 'month':
            timeThreshold = now - 30 * 24 * 60 * 60 * 1000; // 30 days
            break;
          case 'all':
          default:
            timeThreshold = 0; // All time
        }

        // Process visitors data
        visitorsSnapshot.forEach((childSnapshot) => {
          const visitor = childSnapshot.val();
          visitor.id = childSnapshot.key;

          // Apply time filter
          if (visitor.timestamp && visitor.timestamp < timeThreshold) {
            return;
          }

          // Skip admin pages for consistency with page views counting
          if (!visitor.page || !visitor.page.startsWith('/admin')) {
            visitors.push(visitor);
            sessionIds.add(visitor.sessionId);

            if (visitor.location?.country) {
              countries.add(visitor.location.country);
              countryViews[visitor.location.country] = (countryViews[visitor.location.country] || 0) + 1;
            }

            if (visitor.location?.city) {
              cities.add(visitor.location.city);
              cityViews[visitor.location.city] = (cityViews[visitor.location.city] || 0) + 1;
            }
          }
        });

        // Process page views data
        if (pageViewsSnapshot.exists()) {
          pageViewsSnapshot.forEach((childSnapshot) => {
            const pageView = childSnapshot.val();

            // Apply time filter
            if (pageView.timestamp && pageView.timestamp < timeThreshold) {
              return;
            }

            pageViews[pageView.page] = (pageViews[pageView.page] || 0) + 1;
          });
        }

        // Sort data for top lists
        const sortedPages = Object.entries(pageViews)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const sortedCountries = Object.entries(countryViews)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const sortedCities = Object.entries(cityViews)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        // Sort visitors by timestamp (most recent first)
        const sortedVisitors = [...visitors].sort((a, b) => {
          return (b.timestamp || 0) - (a.timestamp || 0);
        }).slice(0, 10);

        // Process users data
        let totalUsers = 0;
        let registeredUsers = 0;
        let anonymousVisitors = 0;

        // Count authenticated vs anonymous visitors
        const authenticatedSessionIds = new Set<string>();

        // Only count from the same filtered visitors we used for sessionIds
        visitors.forEach((visitor) => {
          if (visitor.isAuthenticated && visitor.sessionId) {
            authenticatedSessionIds.add(visitor.sessionId);
          }
        });

        // Calculate anonymous visitors (unique sessions that aren't authenticated)
        registeredUsers = authenticatedSessionIds.size;
        anonymousVisitors = sessionIds.size - authenticatedSessionIds.size;

        // Process registered users by role
        const usersByRole: Record<string, number> = {
          viewer: anonymousVisitors,
          user: 0,
          editor: 0,
          moderator: 0,
          admin: 0,
          superadmin: 0
        };

        if (usersSnapshot.exists()) {
          usersSnapshot.forEach((childSnapshot) => {
            totalUsers++;
            const userData = childSnapshot.val();
            const role = userData.role || 'user';
            usersByRole[role] = (usersByRole[role] || 0) + 1;
          });
        }

        // Calculate total page views
        const totalPageViews = Object.values(pageViews).reduce((sum, count) => sum + count, 0);

        // Total visitors is the number of unique session IDs
        const totalVisitors = sessionIds.size;

        // Total visits is the total number of visits (including repeat visits)
        const totalVisits = visitors.length;

        setStats({
          totalVisitors: totalVisitors,
          totalPageViews: totalPageViews,
          uniqueVisitors: totalVisitors, // Đồng bộ với totalVisitors
          countries: countries.size,
          cities: cities.size,
          totalUsers,
          registeredUsers,
          anonymousVisitors,
          usersByRole,
          topPages: sortedPages,
          topCountries: sortedCountries,
          topCities: sortedCities,
          recentVisitors: sortedVisitors,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1 rounded ${
              timeRange === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded ${
              timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded ${
              timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            30d
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded ${
              timeRange === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Page Views</h2>
          <p className="text-3xl font-bold">{stats.totalPageViews}</p>
          <p className="text-xs text-gray-400 mt-1">Tổng số lượt xem trang</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Registered Users</h2>
          <p className="text-3xl font-bold">{stats.registeredUsers}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng đã đăng nhập</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Total Users</h2>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng đã đăng ký</p>
        </div>
      </div>

      {/* Visitor Stats */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Visitor Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Visitor Types</h3>
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-2xl font-bold">{stats.anonymousVisitors}</p>
                <p className="text-sm text-gray-400">Khách không đăng nhập</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-2xl font-bold">{stats.registeredUsers}</p>
                <p className="text-sm text-gray-400">Người dùng đã đăng nhập</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Tỷ lệ đăng nhập</h3>
            <div className="flex items-center justify-center h-full">
              <p className="text-3xl font-bold">
                {(stats.registeredUsers + stats.anonymousVisitors) > 0
                  ? Math.round((stats.registeredUsers / (stats.registeredUsers + stats.anonymousVisitors)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">Users by Role</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <div key={role} className={`rounded-lg p-4 text-center ${
              role === 'viewer' ? 'bg-gray-600' :
              role === 'user' ? 'bg-blue-900' :
              role === 'editor' ? 'bg-green-900' :
              role === 'moderator' ? 'bg-yellow-900' :
              role === 'admin' || role === 'superadmin' ? 'bg-red-900' : 'bg-gray-700'
            }`}>
              <p className="text-lg font-bold">{count}</p>
              <p className="text-sm text-gray-300">{role.charAt(0).toUpperCase() + role.slice(1)}s</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/admin/users" className="text-blue-500 hover:underline">
            Manage users →
          </Link>
        </div>
      </div>

      {/* Top Pages & Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Top Pages</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-4">Page</th>
                <th className="text-right py-2 px-4">Views</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.topPages).map(([page, count]) => (
                <tr key={page} className="border-t border-gray-700">
                  <td className="py-2 px-4 truncate max-w-[200px]" title={page}>
                    {page}
                  </td>
                  <td className="text-right py-2 px-4">{count}</td>
                </tr>
              ))}
              {Object.keys(stats.topPages).length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-400">
                    No page view data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4">
            <Link href="/admin/analytics" className="text-blue-500 hover:underline">
              View all analytics →
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Top Countries</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-4">Country</th>
                <th className="text-right py-2 px-4">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.topCountries).map(([country, count]) => (
                <tr key={country} className="border-t border-gray-700">
                  <td className="py-2 px-4">{country}</td>
                  <td className="text-right py-2 px-4">{count}</td>
                </tr>
              ))}
              {Object.keys(stats.topCountries).length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-400">
                    No country data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4">
            <Link href="/admin/location-analytics" className="text-blue-500 hover:underline">
              View location analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Visitors */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Visitors</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-4">Time</th>
                <th className="text-left py-2 px-4">Page</th>
                <th className="text-left py-2 px-4">Location</th>
                <th className="text-left py-2 px-4">Browser</th>
                <th className="text-left py-2 px-4">Device</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentVisitors.map((visitor) => (
                <tr key={visitor.id} className="border-t border-gray-700">
                  <td className="py-2 px-4">
                    {visitor.timestamp ? new Date(visitor.timestamp).toLocaleString() : 'Unknown'}
                  </td>
                  <td className="py-2 px-4 truncate max-w-[150px]" title={visitor.page}>
                    {visitor.page || 'Unknown'}
                  </td>
                  <td className="py-2 px-4">
                    {visitor.location ? (
                      <span>
                        {[
                          visitor.location.city,
                          visitor.location.country
                        ].filter(Boolean).join(', ') || 'Unknown'}
                      </span>
                    ) : (
                      'Unknown'
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {visitor.browserInfo?.browser || 'Unknown'} {visitor.browserInfo?.version || ''}
                  </td>
                  <td className="py-2 px-4">
                    {visitor.browserInfo?.mobile ? 'Mobile' : 'Desktop'}
                  </td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/visitor/${visitor.id}`} className="text-blue-500 hover:underline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
              {stats.recentVisitors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    No visitor data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Link href="/admin/analytics" className="text-blue-500 hover:underline">
            View all visitors →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default withAdminProtection(AdminDashboardPage);
