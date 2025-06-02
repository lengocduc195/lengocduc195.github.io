'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentVisitors } from '@/lib/analyticsService';
import { VisitorData } from '@/lib/analyticsService';
import { withAdminProtection } from '@/contexts/AdminContext';

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

function LocationAnalyticsDashboard() {
  const { currentUser } = useAuth();
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
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
        const recentVisitors = await getRecentVisitors(200);
        setVisitors(recentVisitors);

        // Calculate location statistics
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
              const countryName = visitor.location.countryCode
                ? `${visitor.location.country} (${visitor.location.countryCode})`
                : visitor.location.country;
              stats.country[countryName] = (stats.country[countryName] || 0) + 1;
            }

            // Count regions
            if (visitor.location.region) {
              const regionName = visitor.location.regionCode
                ? `${visitor.location.region} (${visitor.location.regionCode})`
                : visitor.location.region;
              stats.region[regionName] = (stats.region[regionName] || 0) + 1;
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
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [currentUser]);

  // Helper function to sort stats by count
  const sortStats = (stats: Record<string, number>) => {
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, number>);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Location Analytics</h1>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Location Analytics</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Location Analytics</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>You must be logged in to view analytics</p>
        </div>
      </div>
    );
  }

  const sortedCountries = sortStats(locationStats.country);
  const sortedRegions = sortStats(locationStats.region);
  const sortedCities = sortStats(locationStats.city);
  const sortedDistricts = sortStats(locationStats.district);
  const sortedWards = sortStats(locationStats.ward);
  const sortedStreets = sortStats(locationStats.street);
  const sortedPostalCodes = sortStats(locationStats.postalCode);
  const sortedTimezones = sortStats(locationStats.timezone);
  const sortedISPs = sortStats(locationStats.isp);
  const sortedConnectionTypes = sortStats(locationStats.connectionType);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Thống kê vị trí</h1>

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
            {Object.entries(sortedTimezones).map(([timezone, count]) => (
              <tr key={timezone} className="border-t border-gray-700">
                <td className="py-2 px-4">{timezone}</td>
                <td className="text-right py-2 px-4">{count}</td>
                <td className="text-right py-2 px-4">
                  {((count / visitors.length) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            {Object.keys(sortedTimezones).length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-400">Không có dữ liệu timezone</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withAdminProtection(LocationAnalyticsDashboard);
