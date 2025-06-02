'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rtdb } from '@/lib/firebase';
import { ref, get, query, orderByChild, limitToLast, startAt, endAt } from 'firebase/database';
import { withAdminProtection } from '@/contexts/AdminContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import chart components to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Pagination component for referrers table
const ReferrersTable = ({
  referrers,
  totalVisitors,
  itemsPerPage = 10
}: {
  referrers: Record<string, number>;
  totalVisitors: number;
  itemsPerPage?: number;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Convert referrers to array and sort
  const referrersArray = Object.entries(referrers)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate total pages
  const totalPages = Math.ceil(referrersArray.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = referrersArray.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (referrersArray.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Nguồn</th>
              <th className="py-2 px-4 text-right">Lượt truy cập</th>
              <th className="py-2 px-4 text-right">Phần trăm</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-400">Không có dữ liệu nguồn truy cập</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Nguồn</th>
              <th className="py-2 px-4 text-right">Lượt truy cập</th>
              <th className="py-2 px-4 text-right">Phần trăm</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(({ referrer, count }, index) => (
              <tr key={referrer} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                <td className="py-2 px-4">{referrer}</td>
                <td className="py-2 px-4 text-right">{count}</td>
                <td className="py-2 px-4 text-right">
                  {((count / totalVisitors) * 100).toFixed(1)}%
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

// Pagination component for countries table
const CountriesTable = ({
  countries,
  totalVisitors,
  itemsPerPage = 10
}: {
  countries: Record<string, number>;
  totalVisitors: number;
  itemsPerPage?: number;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Convert countries to array and sort
  const countriesArray = Object.entries(countries)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate total pages
  const totalPages = Math.ceil(countriesArray.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = countriesArray.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (countriesArray.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Quốc gia</th>
              <th className="py-2 px-4 text-right">Lượt truy cập</th>
              <th className="py-2 px-4 text-right">Phần trăm</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-400">Không có dữ liệu vị trí</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Quốc gia</th>
              <th className="py-2 px-4 text-right">Lượt truy cập</th>
              <th className="py-2 px-4 text-right">Phần trăm</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(({ country, count }, index) => (
              <tr key={country} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                <td className="py-2 px-4">{country}</td>
                <td className="py-2 px-4 text-right">{count}</td>
                <td className="py-2 px-4 text-right">
                  {((count / totalVisitors) * 100).toFixed(1)}%
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

// Pagination component for top pages table
const TopPagesTable = ({
  pages,
  totalPageViews,
  itemsPerPage = 10
}: {
  pages: Array<{page: string, views: number}>;
  totalPageViews: number;
  itemsPerPage?: number;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(pages.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pages.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="overflow-y-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Trang</th>
              <th className="py-2 px-4 text-right">Lượt xem</th>
              <th className="py-2 px-4 text-right">Phần trăm</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((page, index) => (
              <tr key={page.page} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                <td className="py-2 px-4 truncate max-w-md">{page.page}</td>
                <td className="py-2 px-4 text-right">{page.views}</td>
                <td className="py-2 px-4 text-right">
                  {((page.views / totalPageViews) * 100).toFixed(1)}%
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

interface StatisticsData {
  // Visitor statistics
  totalVisitors: number;
  uniqueVisitors: number;
  registeredUsers: number;
  anonymousVisitors: number;

  // Page view statistics
  totalPageViews: number;
  averagePageViewsPerVisitor: number;
  topPages: Array<{page: string, views: number}>;

  // Time statistics
  averageTimeOnSite: number; // in seconds
  averageTimePerPage: number; // in seconds
  bounceRate: number; // percentage of single-page visits

  // Device statistics
  deviceTypes: Record<string, number>; // desktop, mobile, tablet
  browsers: Record<string, number>;
  operatingSystems: Record<string, number>;

  // Location statistics
  countries: Record<string, number>;
  regions: Record<string, number>;
  cities: Record<string, number>;

  // Interaction statistics
  totalInteractions: number;
  interactionsByType: Record<string, number>; // clicks, scrolls, form_submits, etc.

  // Time-based statistics
  visitorsByHour: number[];
  visitorsByDay: number[];
  visitorsByMonth: number[];

  // Referrer statistics
  referrers: Record<string, number>;

  // Loading state
  isLoading: boolean;
}

// Date range type
type DateRange = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';

function StatisticsPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StatisticsData>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    registeredUsers: 0,
    anonymousVisitors: 0,
    totalPageViews: 0,
    averagePageViewsPerVisitor: 0,
    topPages: [],
    averageTimeOnSite: 0,
    averageTimePerPage: 0,
    bounceRate: 0,
    deviceTypes: {},
    browsers: {},
    operatingSystems: {},
    countries: {},
    regions: {},
    cities: {},
    totalInteractions: 0,
    interactionsByType: {},
    visitorsByHour: Array(24).fill(0),
    visitorsByDay: Array(7).fill(0),
    visitorsByMonth: Array(12).fill(0),
    referrers: {},
    isLoading: true,
  });

  const [dateRange, setDateRange] = useState<DateRange>('last30days');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range based on selection
  const getDateRange = (): { startDate: Date; endDate: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case 'today':
        return { startDate: today, endDate: now };

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { startDate: yesterday, endDate: today };

      case 'last7days':
        const last7days = new Date(today);
        last7days.setDate(last7days.getDate() - 7);
        return { startDate: last7days, endDate: now };

      case 'last30days':
        const last30days = new Date(today);
        last30days.setDate(last30days.getDate() - 30);
        return { startDate: last30days, endDate: now };

      case 'thisMonth':
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { startDate: thisMonthStart, endDate: now };

      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return { startDate: lastMonthStart, endDate: lastMonthEnd };

      case 'custom':
        return {
          startDate: new Date(customStartDate),
          endDate: new Date(customEndDate + 'T23:59:59'),
        };

      default:
        return { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: now };
    }
  };

  useEffect(() => {
    const fetchStatisticsData = async () => {
      if (!rtdb) {
        setError('Firebase Realtime Database is not initialized');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get date range
        const { startDate, endDate } = getDateRange();
        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();

        // Fetch visitors data
        const visitorsRef = ref(rtdb, 'analytics/visitors');
        const visitorsQuery = query(
          visitorsRef,
          orderByChild('timestamp'),
          startAt(startTimestamp),
          endAt(endTimestamp)
        );
        const visitorsSnapshot = await get(visitorsQuery);

        // Fetch page views data
        const pageViewsRef = ref(rtdb, 'analytics/pageViews');
        const pageViewsQuery = query(
          pageViewsRef,
          orderByChild('timestamp'),
          startAt(startTimestamp),
          endAt(endTimestamp)
        );
        const pageViewsSnapshot = await get(pageViewsQuery);

        // Fetch time spent data
        const timeSpentRef = ref(rtdb, 'analytics/timeSpent');
        const timeSpentQuery = query(
          timeSpentRef,
          orderByChild('timestamp'),
          startAt(startTimestamp),
          endAt(endTimestamp)
        );
        const timeSpentSnapshot = await get(timeSpentQuery);

        // Fetch interactions data
        const interactionsRef = ref(rtdb, 'analytics/interactions');
        const interactionsQuery = query(
          interactionsRef,
          orderByChild('timestamp'),
          startAt(startTimestamp),
          endAt(endTimestamp)
        );
        const interactionsSnapshot = await get(interactionsQuery);

        // Process data
        const visitors: any[] = [];
        const sessionIds = new Set<string>();
        const userIds = new Set<string>();
        const pageViews: Record<string, number> = {};
        const deviceTypes: Record<string, number> = {};
        const browsers: Record<string, number> = {};
        const operatingSystems: Record<string, number> = {};
        const countries: Record<string, number> = {};
        const regions: Record<string, number> = {};
        const cities: Record<string, number> = {};
        const interactionsByType: Record<string, number> = {};
        const referrers: Record<string, number> = {};
        const visitorsByHour = Array(24).fill(0);
        const visitorsByDay = Array(7).fill(0);
        const visitorsByMonth = Array(12).fill(0);

        let totalTimeSpent = 0;
        let totalPageViewsCount = 0;
        let totalSessions = 0;
        let bounceSessions = 0;

        // Process visitors data
        if (visitorsSnapshot.exists()) {
          visitorsSnapshot.forEach((childSnapshot) => {
            const visitor = childSnapshot.val();

            // Skip admin pages for consistency
            if (!visitor.page || !visitor.page.startsWith('/admin')) {
              visitors.push(visitor);

              // Count unique visitors
              if (visitor.sessionId) {
                sessionIds.add(visitor.sessionId);
              }

              // Count registered users
              if (visitor.userId) {
                userIds.add(visitor.userId);
              }

              // Count device types
              if (visitor.browserInfo?.deviceType) {
                deviceTypes[visitor.browserInfo.deviceType] = (deviceTypes[visitor.browserInfo.deviceType] || 0) + 1;
              }

              // Count browsers
              if (visitor.browserInfo?.browser) {
                browsers[visitor.browserInfo.browser] = (browsers[visitor.browserInfo.browser] || 0) + 1;
              }

              // Count operating systems
              if (visitor.browserInfo?.os) {
                operatingSystems[visitor.browserInfo.os] = (operatingSystems[visitor.browserInfo.os] || 0) + 1;
              }

              // Count countries
              if (visitor.location?.country) {
                countries[visitor.location.country] = (countries[visitor.location.country] || 0) + 1;
              }

              // Count regions
              if (visitor.location?.region) {
                regions[visitor.location.region] = (regions[visitor.location.region] || 0) + 1;
              }

              // Count cities
              if (visitor.location?.city) {
                cities[visitor.location.city] = (cities[visitor.location.city] || 0) + 1;
              }

              // Count referrers
              if (visitor.referrer && !visitor.referrer.includes(window.location.hostname)) {
                try {
                  const referrerUrl = new URL(visitor.referrer);
                  const referrerDomain = referrerUrl.hostname;
                  referrers[referrerDomain] = (referrers[referrerDomain] || 0) + 1;
                } catch (e) {
                  // Invalid URL, skip
                }
              }

              // Count visitors by hour, day, and month
              if (visitor.timestamp) {
                const date = new Date(visitor.timestamp);
                visitorsByHour[date.getHours()]++;
                visitorsByDay[date.getDay()]++;
                visitorsByMonth[date.getMonth()]++;
              }
            }
          });
        }

        // Process page views data
        if (pageViewsSnapshot.exists()) {
          pageViewsSnapshot.forEach((childSnapshot) => {
            const pageView = childSnapshot.val();

            // Count page views
            if (pageView.page) {
              pageViews[pageView.page] = (pageViews[pageView.page] || 0) + 1;
              totalPageViewsCount++;
            }
          });
        }

        // Process time spent data
        if (timeSpentSnapshot.exists()) {
          const sessionPageCounts: Record<string, number> = {};

          timeSpentSnapshot.forEach((childSnapshot) => {
            const timeSpent = childSnapshot.val();

            // Sum total time spent
            if (timeSpent.timeSpent) {
              totalTimeSpent += timeSpent.timeSpent;
            }

            // Count pages per session for bounce rate
            if (timeSpent.sessionId && timeSpent.page) {
              if (!sessionPageCounts[timeSpent.sessionId]) {
                sessionPageCounts[timeSpent.sessionId] = 0;
                totalSessions++;
              }
              sessionPageCounts[timeSpent.sessionId]++;
            }
          });

          // Calculate bounce sessions (sessions with only one page view)
          Object.values(sessionPageCounts).forEach((pageCount) => {
            if (pageCount === 1) {
              bounceSessions++;
            }
          });
        }

        // Process interactions data
        let totalInteractions = 0;
        if (interactionsSnapshot.exists()) {
          interactionsSnapshot.forEach((childSnapshot) => {
            const interaction = childSnapshot.val();

            // Count interactions by type
            if (interaction.type) {
              interactionsByType[interaction.type] = (interactionsByType[interaction.type] || 0) + 1;
              totalInteractions++;
            }
          });
        }

        // Sort top pages
        const topPages = Object.entries(pageViews)
          .map(([page, views]) => ({ page, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        // Calculate statistics
        const uniqueVisitors = sessionIds.size;

        // Count authenticated visitors based on isAuthenticated flag
        const authenticatedVisitors = new Set<string>();
        visitors.forEach(visitor => {
          if (visitor.isAuthenticated && visitor.sessionId) {
            authenticatedVisitors.add(visitor.sessionId);
          }
        });

        const registeredUsers = authenticatedVisitors.size;
        const anonymousVisitors = uniqueVisitors - registeredUsers;
        const averagePageViewsPerVisitor = uniqueVisitors > 0 ? totalPageViewsCount / uniqueVisitors : 0;
        const averageTimeOnSite = uniqueVisitors > 0 ? totalTimeSpent / uniqueVisitors : 0;
        const averageTimePerPage = totalPageViewsCount > 0 ? totalTimeSpent / totalPageViewsCount : 0;
        const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;

        // Update state with calculated statistics
        setStats({
          totalVisitors: uniqueVisitors, // Total number of unique visitors
          uniqueVisitors,
          registeredUsers,
          anonymousVisitors,
          totalPageViews: totalPageViewsCount,
          averagePageViewsPerVisitor,
          topPages,
          averageTimeOnSite,
          averageTimePerPage,
          bounceRate,
          deviceTypes,
          browsers,
          operatingSystems,
          countries,
          regions,
          cities,
          totalInteractions,
          interactionsByType,
          visitorsByHour,
          visitorsByDay,
          visitorsByMonth,
          referrers,
          isLoading: false,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching statistics data:', err);
        setError(err.message || 'Failed to load statistics data');
        setLoading(false);
      }
    };

    fetchStatisticsData();
  }, [dateRange, customStartDate, customEndDate]);

  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-16">
        <h1 className="text-2xl font-bold mb-6">Thống kê chi tiết</h1>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-center">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-6 pt-16">
        <h1 className="text-2xl font-bold mb-6">Thống kê chi tiết</h1>
        <div className="bg-red-900 rounded-lg p-6 shadow-lg">
          <p className="text-center">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-16">
      <h1 className="text-2xl font-bold mb-6">Thống kê chi tiết</h1>

      {/* Date range selector */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="font-medium">Khoảng thời gian:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="last7days">7 ngày qua</option>
            <option value="last30days">30 ngày qua</option>
            <option value="thisMonth">Tháng này</option>
            <option value="lastMonth">Tháng trước</option>
            <option value="custom">Tùy chỉnh</option>
          </select>

          {dateRange === 'custom' && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-gray-700 text-white rounded px-3 py-2"
              />
              <span>đến</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-gray-700 text-white rounded px-3 py-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Lượt xem trang</h2>
          <p className="text-3xl font-bold">{stats.totalPageViews.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Tổng số lượt xem trang</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Người dùng đã đăng ký</h2>
          <p className="text-3xl font-bold">{stats.registeredUsers.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng đã đăng nhập</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Tỷ lệ thoát</h2>
          <p className="text-3xl font-bold">{stats.bounceRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Tỷ lệ người dùng chỉ xem 1 trang</p>
        </div>
      </div>

      {/* User type breakdown */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Phân loại người dùng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{stats.registeredUsers.toLocaleString()}</p>
            <p className="text-gray-400">Người dùng đã đăng nhập</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{stats.anonymousVisitors.toLocaleString()}</p>
            <p className="text-gray-400">Khách không đăng nhập</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{stats.averagePageViewsPerVisitor.toFixed(1)}</p>
            <p className="text-gray-400">Trang/phiên truy cập</p>
          </div>
        </div>

        {typeof window !== 'undefined' && (
          <div className="mt-6">
            <Chart
              options={{
                labels: ['Người dùng đã đăng ký', 'Khách không đăng ký'],
                colors: ['#4ade80', '#60a5fa'],
                legend: {
                  position: 'bottom',
                  labels: {
                    colors: '#fff'
                  }
                },
                dataLabels: {
                  enabled: true,
                  formatter: function(val) {
                    return val.toFixed(1) + '%';
                  }
                },
                plotOptions: {
                  pie: {
                    donut: {
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: 'Tổng',
                          color: '#fff'
                        }
                      }
                    }
                  }
                }
              }}
              series={[stats.registeredUsers, stats.anonymousVisitors]}
              type="donut"
              height={300}
            />
          </div>
        )}
      </div>

      {/* Time statistics */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Thống kê thời gian</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{formatTime(stats.averageTimeOnSite)}</p>
            <p className="text-gray-400">Thời gian trung bình trên trang web</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{formatTime(stats.averageTimePerPage)}</p>
            <p className="text-gray-400">Thời gian trung bình trên mỗi trang</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{stats.bounceRate.toFixed(1)}%</p>
            <p className="text-gray-400">Tỷ lệ thoát</p>
          </div>
        </div>
      </div>

      {/* Visitors by time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Visitors by hour */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Lượt truy cập theo giờ</h2>
          {typeof window !== 'undefined' && (
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  background: 'transparent',
                  toolbar: {
                    show: false
                  }
                },
                xaxis: {
                  categories: Array.from({ length: 24 }, (_, i) => `${i}h`),
                  labels: {
                    style: {
                      colors: '#fff'
                    }
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      colors: '#fff'
                    }
                  }
                },
                grid: {
                  borderColor: '#374151'
                },
                colors: ['#60a5fa']
              }}
              series={[{
                name: 'Lượt truy cập',
                data: stats.visitorsByHour
              }]}
              type="bar"
              height={300}
            />
          )}
        </div>

        {/* Visitors by day */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Lượt truy cập theo ngày trong tuần</h2>
          {typeof window !== 'undefined' && (
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  background: 'transparent',
                  toolbar: {
                    show: false
                  }
                },
                xaxis: {
                  categories: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                  labels: {
                    style: {
                      colors: '#fff'
                    }
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      colors: '#fff'
                    }
                  }
                },
                grid: {
                  borderColor: '#374151'
                },
                colors: ['#4ade80']
              }}
              series={[{
                name: 'Lượt truy cập',
                data: stats.visitorsByDay
              }]}
              type="bar"
              height={300}
            />
          )}
        </div>
      </div>

      {/* Device and browser statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Device types */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Loại thiết bị</h2>
          {typeof window !== 'undefined' && Object.keys(stats.deviceTypes).length > 0 && (
            <Chart
              options={{
                labels: Object.keys(stats.deviceTypes).map(key =>
                  key.charAt(0).toUpperCase() + key.slice(1)
                ),
                colors: ['#4ade80', '#60a5fa', '#f472b6'],
                legend: {
                  position: 'bottom',
                  labels: {
                    colors: '#fff'
                  }
                },
                dataLabels: {
                  enabled: true,
                  formatter: function(val) {
                    return val.toFixed(1) + '%';
                  }
                }
              }}
              series={Object.values(stats.deviceTypes)}
              type="pie"
              height={300}
            />
          )}
        </div>

        {/* Browsers */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Trình duyệt</h2>
          {typeof window !== 'undefined' && Object.keys(stats.browsers).length > 0 && (
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  background: 'transparent',
                  toolbar: {
                    show: false
                  }
                },
                xaxis: {
                  categories: Object.keys(stats.browsers),
                  labels: {
                    style: {
                      colors: '#fff'
                    }
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      colors: '#fff'
                    }
                  }
                },
                grid: {
                  borderColor: '#374151'
                },
                colors: ['#f472b6']
              }}
              series={[{
                name: 'Lượt truy cập',
                data: Object.values(stats.browsers)
              }]}
              type="bar"
              height={300}
            />
          )}
        </div>
      </div>

      {/* Location statistics */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Thống kê vị trí</h2>

        <div>
          <h3 className="text-lg font-medium mb-2">Timezones</h3>
          <CountriesTable countries={stats.countries} totalVisitors={stats.totalVisitors} />
        </div>
      </div>

      {/* Page statistics */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Thống kê các trang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Tổng lượt xem trang</h3>
            <p className="text-3xl font-bold">{stats.totalPageViews.toLocaleString()}</p>

            <h3 className="text-lg font-medium mt-6 mb-2">Các trang được xem nhiều nhất</h3>
            <TopPagesTable pages={stats.topPages} totalPageViews={stats.totalPageViews} />
          </div>

          {typeof window !== 'undefined' && (
            <div>
              <Chart
                options={{
                  labels: stats.topPages.slice(0, 7).map(page => {
                    // Simplify page path for display
                    const path = page.page;
                    // If path is too long, truncate it
                    return path.length > 20 ? path.substring(0, 17) + '...' : path;
                  }),
                  legend: {
                    position: 'bottom',
                    labels: {
                      colors: '#fff'
                    }
                  },
                  dataLabels: {
                    enabled: true,
                    formatter: function(val) {
                      return val.toFixed(1) + '%';
                    }
                  },
                  colors: ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#fb7185']
                }}
                series={stats.topPages.slice(0, 7).map(page => page.views)}
                type="pie"
                height={350}
              />
            </div>
          )}
        </div>
      </div>

      {/* Interaction statistics */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Thống kê tương tác</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Tổng số tương tác</h3>
            <p className="text-3xl font-bold">{stats.totalInteractions.toLocaleString()}</p>

            <h3 className="text-lg font-medium mt-6 mb-2">Tương tác theo loại</h3>
            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full bg-gray-700 rounded-lg">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left">Loại tương tác</th>
                    <th className="py-2 px-4 text-right">Số lượng</th>
                    <th className="py-2 px-4 text-right">Phần trăm</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.interactionsByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count], index) => (
                      <tr key={type} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                        <td className="py-2 px-4">{type}</td>
                        <td className="py-2 px-4 text-right">{count}</td>
                        <td className="py-2 px-4 text-right">
                          {((count / stats.totalInteractions) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {typeof window !== 'undefined' && Object.keys(stats.interactionsByType).length > 0 && (
            <div>
              <Chart
                options={{
                  labels: Object.keys(stats.interactionsByType).map(key =>
                    key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)
                  ),
                  legend: {
                    position: 'bottom',
                    labels: {
                      colors: '#fff'
                    }
                  },
                  dataLabels: {
                    enabled: true,
                    formatter: function(val) {
                      return val.toFixed(1) + '%';
                    }
                  },
                  colors: ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#fb7185']
                }}
                series={Object.values(stats.interactionsByType)}
                type="pie"
                height={350}
              />
            </div>
          )}
        </div>
      </div>

      {/* Referrer statistics */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Nguồn truy cập</h2>
        <ReferrersTable referrers={stats.referrers} totalVisitors={stats.totalVisitors} />
      </div>

      <div className="flex justify-between mt-8">
        <Link href="/admin/dashboard" className="text-blue-500 hover:underline">
          ← Quay lại Dashboard
        </Link>
        <Link href="/admin/analytics" className="text-blue-500 hover:underline">
          Xem phân tích chi tiết →
        </Link>
      </div>
    </div>
  );
}

export default withAdminProtection(StatisticsPage);
