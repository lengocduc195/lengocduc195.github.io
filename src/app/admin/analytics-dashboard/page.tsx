'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rtdb } from '@/lib/firebase';
import { ref, get, query, orderByChild, limitToLast, startAt, endAt } from 'firebase/database';
import { withAdminProtection } from '@/contexts/AdminContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getRecentVisitors, getPageViews } from '@/lib/analyticsService';
import { VisitorData } from '@/lib/analyticsService';

// Dynamically import chart components to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Tab types
type TabType = 'overview' | 'statistics' | 'location' | 'visitors';

// Date range type
type DateRange = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';

// Interface for dashboard stats
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

// Interface for detailed statistics
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

// Interface for location statistics
interface LocationStats {
  country: Record<string, number>;
  region: Record<string, number>;
  city: Record<string, number>;
  district: Record<string, number>;
  ward: Record<string, number>;
  street: Record<string, number>;
  postalCode: Record<string, number>;
  timezone: Record<string, number>;
  isp: Record<string, number>;
  connectionType: Record<string, number>;
}

function AnalyticsDashboardPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('last30days');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('all');

  // States for different data types
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
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

  const [locationStats, setLocationStats] = useState<LocationStats>({
    country: {},
    region: {},
    city: {},
    district: {},
    ward: {},
    street: {},
    postalCode: {},
    timezone: {},
    isp: {},
    connectionType: {},
  });

  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [pageViews, setPageViews] = useState<Record<string, number>>({});

  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Helper function to sort stats objects
  const sortStats = (stats: Record<string, number>): Record<string, number> => {
    return Object.fromEntries(
      Object.entries(stats).sort((a, b) => b[1] - a[1])
    );
  };

  // Reusable component for stats cards
  const StatsCards = ({ items }: { items: { title: string; value: string | number; }[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">{item.title}</h2>
          <p className="text-3xl font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );

  // Reusable component for top pages table
  const TopPagesTable = ({
    pages,
    totalViews,
    itemsPerPage = 10
  }: {
    pages: Array<{page: string, views: number}> | Record<string, number>;
    totalViews: number;
    itemsPerPage?: number;
  }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Ensure pages is not empty and totalViews is valid
    if ((!Array.isArray(pages) && Object.keys(pages).length === 0) ||
        (Array.isArray(pages) && pages.length === 0) ||
        !totalViews) {
      return (
        <div className="text-center py-4 text-gray-400">
          Không có dữ liệu về lượt xem trang
        </div>
      );
    }

    const pageEntries = Array.isArray(pages)
      ? pages
      : Object.entries(pages).map(([page, views]) => ({ page, views }));

    // Sort entries by views in descending order
    const sortedEntries = [...pageEntries].sort((a, b) => {
      const viewsA = typeof a === 'object' ? a.views : 0;
      const viewsB = typeof b === 'object' ? b.views : 0;
      return viewsB - viewsA;
    });

    // Calculate total pages
    const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedEntries.slice(indexOfFirstItem, indexOfLastItem);

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
              {currentItems.map((page, index) => {
                const pageUrl = typeof page === 'object' ? page.page : page;
                const views = typeof page === 'object' ? page.views : pages[page];

                return (
                  <tr key={pageUrl || index} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                    <td className="py-2 px-4 truncate max-w-md">{pageUrl || 'Unknown'}</td>
                    <td className="py-2 px-4 text-right">{views}</td>
                    <td className="py-2 px-4 text-right">
                      {((views / totalViews) * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
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

  // Reusable component for visitor breakdown
  const VisitorBreakdown = ({
    registeredUsers,
    anonymousVisitors,
    averagePageViewsPerVisitor
  }: {
    registeredUsers: number;
    anonymousVisitors: number;
    averagePageViewsPerVisitor?: number;
  }) => (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">Phân loại người dùng</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{registeredUsers.toLocaleString()}</p>
          <p className="text-gray-400">Người dùng đã đăng ký</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{anonymousVisitors.toLocaleString()}</p>
          <p className="text-gray-400">Khách không đăng ký</p>
        </div>
        {averagePageViewsPerVisitor !== undefined && (
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{averagePageViewsPerVisitor.toFixed(1)}</p>
            <p className="text-gray-400">Trang/người dùng</p>
          </div>
        )}
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
            series={[registeredUsers, anonymousVisitors]}
            type="donut"
            height={300}
          />
        </div>
      )}
    </div>
  );

  // Reusable component for recent visitors table
  const RecentVisitorsTable = ({
    visitors,
    showDetails = true,
    itemsPerPage = 10
  }: {
    visitors: any[];
    showDetails?: boolean;
    itemsPerPage?: number;
  }) => {
    const [currentPage, setCurrentPage] = useState(1);

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
                {showDetails && <th className="text-left py-2 px-4">Local Time</th>}
                <th className="text-left py-2 px-4">Page</th>
                <th className="text-left py-2 px-4">Location</th>
                <th className="text-left py-2 px-4">Browser</th>
                {showDetails && <th className="text-left py-2 px-4">OS</th>}
                <th className="text-left py-2 px-4">Device</th>
                {showDetails && <th className="text-left py-2 px-4">Referrer</th>}
                {!showDetails && <th className="text-left py-2 px-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((visitor, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-750' : 'border-t border-gray-700'}>
                  <td className="py-2 px-4">
                    {visitor.timestamp ? new Date(visitor.timestamp).toLocaleString() : 'Unknown'}
                  </td>
                  {showDetails && (
                    <td className="py-2 px-4">
                      {visitor.localTime || 'Unknown'}
                    </td>
                  )}
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
                  {showDetails && (
                    <td className="py-2 px-4">
                      {visitor.browserInfo?.os || 'Unknown'}
                    </td>
                  )}
                  <td className="py-2 px-4">
                    {visitor.browserInfo?.mobile ? 'Mobile' : 'Desktop'}
                  </td>
                  {showDetails && (
                    <td className="py-2 px-4 truncate max-w-[150px]" title={visitor.referrer}>
                      {visitor.referrer || 'Direct'}
                    </td>
                  )}
                  {!showDetails && (
                    <td className="py-2 px-4">
                      <Link href={`/admin/visitor/${visitor.id}`} className="text-blue-500 hover:underline">
                        Details
                      </Link>
                    </td>
                  )}
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

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardData();
    } else if (activeTab === 'statistics') {
      fetchStatisticsData();
    } else if (activeTab === 'location') {
      fetchLocationData();
    } else if (activeTab === 'visitors') {
      fetchVisitorsData();
    }
  }, [activeTab, dateRange, customStartDate, customEndDate, timeRange]);

  // Fetch dashboard overview data
  const fetchDashboardData = async () => {
    if (!rtdb) {
      setError('Firebase Realtime Database is not initialized');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Calculate time threshold based on selected time range
      let timeThreshold = 0;
      const now = Date.now();
      if (timeRange === 'day') {
        timeThreshold = now - 24 * 60 * 60 * 1000; // 1 day
      } else if (timeRange === 'week') {
        timeThreshold = now - 7 * 24 * 60 * 60 * 1000; // 7 days
      } else if (timeRange === 'month') {
        timeThreshold = now - 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      // Fetch visitors data
      const visitorsRef = ref(rtdb, 'analytics/visitors');
      const visitorsQuery = timeRange !== 'all'
        ? query(visitorsRef, orderByChild('timestamp'), startAt(timeThreshold))
        : visitorsRef;
      const visitorsSnapshot = await get(visitorsQuery);

      // Fetch users data
      const usersRef = ref(rtdb, 'users');
      const usersSnapshot = await get(usersRef);

      if (!visitorsSnapshot.exists()) {
        setDashboardStats({
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

      // Process visitors data
      visitorsSnapshot.forEach((childSnapshot) => {
        const visitor = childSnapshot.val();
        visitor.id = childSnapshot.key;

        // Apply time filter
        if (visitor.timestamp && visitor.timestamp < timeThreshold) {
          return;
        }

        // Skip admin pages for consistency
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

          // Count page views
          pageViews[visitor.page || 'unknown'] = (pageViews[visitor.page || 'unknown'] || 0) + 1;
        }
      });

      // Process users data
      let totalUsers = 0;
      let registeredUsers = 0;
      const usersByRole: Record<string, number> = {};

      if (usersSnapshot.exists()) {
        usersSnapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          totalUsers++;

          if (user.role) {
            usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
          } else {
            usersByRole['user'] = (usersByRole['user'] || 0) + 1;
          }
        });
      }

      // Calculate authenticated visitors based on the filtered visitors
      const authenticatedSessionIds = new Set<string>();
      visitors.forEach((visitor) => {
        if (visitor.isAuthenticated && visitor.sessionId) {
          authenticatedSessionIds.add(visitor.sessionId);
        }
      });

      registeredUsers = authenticatedSessionIds.size;
      const anonymousVisitors = sessionIds.size - registeredUsers;

      // Sort data for display
      const sortedPages = sortStats(pageViews);
      const sortedCountries = sortStats(countryViews);
      const sortedCities = sortStats(cityViews);

      // Sort visitors by timestamp (most recent first)
      const sortedVisitors = [...visitors].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

      // Calculate total page views
      const totalPageViews = Object.values(pageViews).reduce((sum, count) => sum + count, 0);

      // Unique visitors is the number of unique session IDs
      const uniqueVisitors = sessionIds.size;

      // Total visitors is the total number of visits (including repeat visits)
      const totalVisitors = visitors.length;

      setDashboardStats({
        totalVisitors: totalVisitors,
        totalPageViews: totalPageViews,
        uniqueVisitors: uniqueVisitors,
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

  // Fetch detailed statistics data
  const fetchStatisticsData = async () => {
    if (!currentUser) {
      setError('You must be logged in to view analytics');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get recent visitors - use the same approach as the visitors tab
      const recentVisitors = await getRecentVisitors(100);

      // Process data
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

      // Filter out admin pages first
      const filteredVisitors = recentVisitors.filter(visitor => !visitor.page || !visitor.page.startsWith('/admin'));

      // Process visitors data
      filteredVisitors.forEach(visitor => {
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

        // Count page views
        pageViews[visitor.page || 'unknown'] = (pageViews[visitor.page || 'unknown'] || 0) + 1;
        totalPageViewsCount++;

        // Count referrers
        if (visitor.referrer && typeof window !== 'undefined' && !visitor.referrer.includes(window.location.hostname)) {
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
      });

      // Fetch interactions data from Firebase if needed
      if (rtdb) {
        try {
          const interactionsRef = ref(rtdb, 'analytics/interactions');
          const interactionsQuery = query(interactionsRef, limitToLast(100));
          const interactionsSnapshot = await get(interactionsQuery);

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
        } catch (error) {
          console.error('Error fetching interactions data:', error);
          // Continue with other data even if interactions fail
        }
      }

      // Sort top pages
      let topPages = [];
      if (Object.keys(pageViews).length > 0) {
        topPages = Object.entries(pageViews)
          .map(([page, views]) => ({ page, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
      }

      // Calculate statistics
      const uniqueVisitors = sessionIds.size;

      // Count authenticated visitors based on isAuthenticated flag
      const authenticatedVisitors = new Set<string>();
      filteredVisitors.forEach(visitor => {
        if (visitor.isAuthenticated && visitor.sessionId) {
          authenticatedVisitors.add(visitor.sessionId);
        }
      });

      const registeredUsers = authenticatedVisitors.size;
      const anonymousVisitors = uniqueVisitors - registeredUsers;
      const averagePageViewsPerVisitor = uniqueVisitors > 0 ? totalPageViewsCount / uniqueVisitors : 0;

      // Estimate time statistics since we're not using the timeSpent collection
      const averageTimeOnSite = 120; // Estimate 2 minutes per visitor
      const averageTimePerPage = 60; // Estimate 1 minute per page
      const bounceRate = 30; // Estimate 30% bounce rate

      // Get total interactions
      const totalInteractions = Object.values(interactionsByType).reduce((sum, count) => sum + count, 0);

      // Update state with calculated statistics
      setStats({
        totalVisitors: filteredVisitors.length, // Total number of visits (excluding admin pages)
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

  // Fetch location analytics data
  const fetchLocationData = async () => {
    if (!currentUser) {
      setError('You must be logged in to view analytics');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get recent visitors
      const recentVisitors = await getRecentVisitors(100);
      setVisitors(recentVisitors);

      // Process location data
      const stats: LocationStats = {
        country: {},
        region: {},
        city: {},
        district: {},
        ward: {},
        street: {},
        postalCode: {},
        timezone: {},
        isp: {},
        connectionType: {},
      };

      recentVisitors.forEach(visitor => {
        if (visitor.location) {
          // Count countries
          if (visitor.location.country) {
            stats.country[visitor.location.country] = (stats.country[visitor.location.country] || 0) + 1;
          }

          // Count regions
          if (visitor.location.region) {
            stats.region[visitor.location.region] = (stats.region[visitor.location.region] || 0) + 1;
          }

          // Count cities
          if (visitor.location.city) {
            stats.city[visitor.location.city] = (stats.city[visitor.location.city] || 0) + 1;
          }

          // Count districts
          if (visitor.location.district) {
            stats.district[visitor.location.district] = (stats.district[visitor.location.district] || 0) + 1;
          }

          // Count wards
          if (visitor.location.ward) {
            stats.ward[visitor.location.ward] = (stats.ward[visitor.location.ward] || 0) + 1;
          }

          // Count streets
          if (visitor.location.street) {
            stats.street[visitor.location.street] = (stats.street[visitor.location.street] || 0) + 1;
          }

          // Count postal codes
          if (visitor.location.postalCode) {
            stats.postalCode[visitor.location.postalCode] = (stats.postalCode[visitor.location.postalCode] || 0) + 1;
          }

          // Count timezones
          if (visitor.location.timezone) {
            stats.timezone[visitor.location.timezone] = (stats.timezone[visitor.location.timezone] || 0) + 1;
          }

          // Count ISPs
          if (visitor.location.isp) {
            stats.isp[visitor.location.isp] = (stats.isp[visitor.location.isp] || 0) + 1;
          }

          // Count connection types
          if (visitor.location.connectionType) {
            stats.connectionType[visitor.location.connectionType] = (stats.connectionType[visitor.location.connectionType] || 0) + 1;
          }
        }
      });

      setLocationStats(stats);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching location data:', err);
      setError('Failed to load location data');
      setLoading(false);
    }
  };

  // Fetch visitors data
  const fetchVisitorsData = async () => {
    if (!currentUser) {
      setError('You must be logged in to view analytics');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get recent visitors
      const recentVisitors = await getRecentVisitors(50);
      setVisitors(recentVisitors);

      // Calculate page views (skip admin pages)
      const pageViewsMap: Record<string, number> = {};
      recentVisitors.forEach(visitor => {
        const page = visitor.page || 'unknown';
        // Skip admin pages
        if (!page.startsWith('/admin')) {
          pageViewsMap[page] = (pageViewsMap[page] || 0) + 1;
        }
      });
      setPageViews(pageViewsMap);

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching visitors data:', err);
      setError('Failed to load visitors data');
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-16">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
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
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="bg-red-900 rounded-lg p-6 shadow-lg">
          <p className="text-center">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-16">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-2 px-4 mr-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 mr-2 ${activeTab === 'statistics' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('statistics')}
        >
          Thống kê chi tiết
        </button>
        <button
          className={`py-2 px-4 mr-2 ${activeTab === 'location' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('location')}
        >
          Location Analytics
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'visitors' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('visitors')}
        >
          Recent Visitors
        </button>
      </div>

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

      {/* Tab content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <StatsCards
            items={[
              { title: "Page Views", value: dashboardStats.totalPageViews },
              { title: "Unique Visitors", value: dashboardStats.uniqueVisitors },
              { title: "Countries", value: dashboardStats.countries }
            ]}
          />

          {/* Visitor Stats */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Visitor Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Visitor Types</h3>
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold">{dashboardStats.anonymousVisitors}</p>
                    <p className="text-sm text-gray-400">Khách không đăng nhập</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold">{dashboardStats.registeredUsers}</p>
                    <p className="text-sm text-gray-400">Người dùng đã đăng nhập</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Phạm vi địa lý</h3>
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold">{dashboardStats.countries}</p>
                    <p className="text-sm text-gray-400">Quốc gia</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold">{dashboardStats.cities}</p>
                    <p className="text-sm text-gray-400">Thành phố</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">Người dùng theo vai trò</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(dashboardStats.usersByRole).map(([role, count]) => (
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
          </div>

          {/* Top Pages and Countries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Các trang phổ biến</h2>
              <div className="overflow-y-auto max-h-80">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4">Trang</th>
                      <th className="text-right py-2 px-4">Lượt xem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(dashboardStats.topPages).map(([page, count], index) => (
                      <tr key={page} className={index % 2 === 0 ? 'bg-gray-750' : 'border-t border-gray-700'}>
                        <td className="py-2 px-4 truncate max-w-[200px]" title={page}>{page}</td>
                        <td className="text-right py-2 px-4">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Quốc gia hàng đầu</h2>
              <div className="overflow-y-auto max-h-80">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4">Quốc gia</th>
                      <th className="text-right py-2 px-4">Lượt truy cập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(dashboardStats.topCountries).map(([country, count], index) => (
                      <tr key={country} className={index % 2 === 0 ? 'bg-gray-750' : 'border-t border-gray-700'}>
                        <td className="py-2 px-4">{country}</td>
                        <td className="text-right py-2 px-4">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Visitors */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Người truy cập gần đây</h2>
            <RecentVisitorsTable visitors={dashboardStats.recentVisitors} showDetails={false} />
          </div>
        </>
      )}

      {activeTab === 'statistics' && (
        <>
          {/* Overview stats */}
          <StatsCards
            items={[
              { title: "Lượt xem trang", value: stats.totalPageViews.toLocaleString() },
              { title: "Người dùng duy nhất", value: stats.uniqueVisitors.toLocaleString() },
              { title: "Tỷ lệ thoát", value: stats.bounceRate.toFixed(1) + '%' }
            ]}
          />

          {/* User type breakdown */}
          <VisitorBreakdown
            registeredUsers={stats.registeredUsers}
            anonymousVisitors={stats.anonymousVisitors}
            averagePageViewsPerVisitor={stats.averagePageViewsPerVisitor}
          />

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

          {/* Page statistics */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Thống kê các trang</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Tổng lượt xem trang</h3>
                <p className="text-3xl font-bold">{stats.totalPageViews.toLocaleString()}</p>

                <h3 className="text-lg font-medium mt-6 mb-2">Các trang được xem nhiều nhất</h3>
                <TopPagesTable pages={stats.topPages} totalViews={stats.totalPageViews} />
              </div>

              {typeof window !== 'undefined' && stats.topPages && stats.topPages.length > 0 && (
                <div>
                  <Chart
                    options={{
                      labels: stats.topPages.slice(0, 7).map(page => {
                        // Simplify page path for display
                        const path = typeof page === 'object' ? page.page : Object.keys(page)[0];
                        // If path is too long, truncate it
                        return path && path.length > 20 ? path.substring(0, 17) + '...' : (path || 'Unknown');
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
                    series={stats.topPages.slice(0, 7).map(page => typeof page === 'object' ? page.views : Object.values(page)[0])}
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
        </>
      )}

      {activeTab === 'location' && (
        <>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Timezones</h2>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Timezone</th>
                  <th className="text-right py-2 px-4">Lượt truy cập</th>
                  <th className="text-right py-2 px-4">Phần trăm</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sortStats(locationStats.timezone)).map(([timezone, count]) => (
                  <tr key={timezone} className="border-t border-gray-700">
                    <td className="py-2 px-4">{timezone}</td>
                    <td className="text-right py-2 px-4">{count}</td>
                    <td className="text-right py-2 px-4">
                      {((count / visitors.length) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'visitors' && (
        <>
          {/* Page Views Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Page Views</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4">Page</th>
                    <th className="text-right py-2 px-4">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(pageViews).map(([page, count]) => (
                    <tr key={page} className="border-t border-gray-700">
                      <td className="py-2 px-4">{page}</td>
                      <td className="text-right py-2 px-4">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Visitors */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Visitors ({visitors.length})</h2>
            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <RecentVisitorsTable visitors={visitors} showDetails={true} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default withAdminProtection(AnalyticsDashboardPage);
