'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentVisitors, getPageViews, getAverageTimeSpent } from '@/lib/analyticsService';
import { VisitorData, PageViewData } from '@/lib/analyticsService';
import Link from 'next/link';
import { withAdminProtection } from '@/contexts/AdminContext';

// Pagination component for visitors table
const VisitorsTable = ({ visitors }: { visitors: VisitorData[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages
  const totalPages = Math.ceil(visitors.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = visitors.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2 px-4">Time</th>
              <th className="text-left py-2 px-4">Local Time</th>
              <th className="text-left py-2 px-4">Page</th>
              <th className="text-left py-2 px-4">Location</th>
              <th className="text-left py-2 px-4">Browser</th>
              <th className="text-left py-2 px-4">OS</th>
              <th className="text-left py-2 px-4">Device</th>
              <th className="text-left py-2 px-4">Referrer</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((visitor, index) => (
              <tr key={index} className="border-t border-gray-700 hover:bg-gray-700">
                <td className="py-2 px-4">
                  <Link href={`/admin/visitor/${visitor.id}`} className="text-blue-500 hover:underline">
                    {visitor.timestamp ? new Date(visitor.timestamp).toLocaleString() : 'Unknown'}
                  </Link>
                </td>
                <td className="py-2 px-4">
                  {visitor.localTime || 'Unknown'}
                </td>
                <td className="py-2 px-4">{visitor.page || 'Unknown'}</td>
                <td className="py-2 px-4">
                  {visitor.location ? (
                    <span title={`${visitor.location.latitude}, ${visitor.location.longitude}`}>
                      {[
                        visitor.location.city,
                        visitor.location.region,
                        visitor.location.country
                      ].filter(Boolean).join(', ') || 'Unknown'}
                    </span>
                  ) : 'Unknown'}
                </td>
                <td className="py-2 px-4">
                  {visitor.browserInfo?.browser || 'Unknown'} {visitor.browserInfo?.version || ''}
                </td>
                <td className="py-2 px-4">{visitor.browserInfo?.os || 'Unknown'}</td>
                <td className="py-2 px-4">{visitor.browserInfo?.mobile ? 'Mobile' : 'Desktop'}</td>
                <td className="py-2 px-4 max-w-xs truncate" title={visitor.referrer}>
                  {visitor.referrer || 'Direct'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="flex items-center">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              &laquo;
            </button>

            <div className="flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 ${
                    currentPage === number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              &raquo;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

// Pagination component for page views table
const PageViewsTable = ({ pageViews }: { pageViews: Record<string, number> }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Convert page views to array and sort
  const pageViewsArray = Object.entries(pageViews)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate total pages
  const totalPages = Math.ceil(pageViewsArray.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pageViewsArray.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2 px-4">Page</th>
              <th className="text-right py-2 px-4">Views</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(({ page, count }) => (
              <tr key={page} className="border-t border-gray-700">
                <td className="py-2 px-4">{page}</td>
                <td className="text-right py-2 px-4">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="flex items-center">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              &laquo;
            </button>

            <div className="flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 ${
                    currentPage === number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              &raquo;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

function AnalyticsDashboard() {
  const { currentUser } = useAuth();
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [pageViews, setPageViews] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!currentUser) {
        setError('You must be logged in to view analytics');
        setLoading(false);
        return;
      }

      try {
        // Get recent visitors
        const recentVisitors = await getRecentVisitors(50);
        setVisitors(recentVisitors);

        // Calculate page views
        const pageViewsMap: Record<string, number> = {};
        recentVisitors.forEach(visitor => {
          const page = visitor.page || 'unknown';
          pageViewsMap[page] = (pageViewsMap[page] || 0) + 1;
        });
        setPageViews(pageViewsMap);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>You must be logged in to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Page Views Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Page Views</h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <PageViewsTable pageViews={pageViews} />
        </div>
      </div>

      {/* Recent Visitors */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Visitors ({visitors.length})</h2>
        <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <VisitorsTable visitors={visitors} />
        </div>
      </div>
    </div>
  );
}

export default withAdminProtection(AnalyticsDashboard);
