'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { rtdb } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { withAdminProtection } from '@/contexts/AdminContext';

// Dynamically import the LocationMap component
const LocationMap = dynamic(() => import('@/components/analytics/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-700 flex items-center justify-center">Loading map...</div>
});

interface VisitorDetail {
  sessionId: string;
  timestamp: number;
  page: string;
  referrer: string;
  userAgent: string;
  language: string;
  screenSize: {
    width: number;
    height: number;
  };
  browserInfo: {
    browser: string;
    version: string;
    os: string;
    mobile: boolean;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    country?: string;
    countryCode?: string;
    region?: string;
    regionCode?: string;
    city?: string;
    district?: string;
    ward?: string;
    street?: string;
    postalCode?: string;
    formattedAddress?: string;
    timezone?: string;
    ip?: string;
    isp?: string;
    connectionType?: string;
    asn?: string;
    organization?: string;
  };
  localTime?: string;
  queryParams?: Record<string, string>;
  [key: string]: any;
}

function VisitorDetailClient() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const visitorId = params.id as string;

  const [visitor, setVisitor] = useState<VisitorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisitorData = async () => {
      if (!currentUser) {
        setError('You must be logged in to view visitor details');
        setLoading(false);
        return;
      }

      if (!visitorId) {
        setError('No visitor ID provided');
        setLoading(false);
        return;
      }

      try {
        if (!rtdb) {
          throw new Error('Firebase Realtime Database is not initialized');
        }

        const visitorRef = ref(rtdb, `analytics/visitors/${visitorId}`);
        const snapshot = await get(visitorRef);

        if (snapshot.exists()) {
          setVisitor(snapshot.val());
        } else {
          setError('Visitor not found');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching visitor data:', err);
        setError('Failed to load visitor data');
        setLoading(false);
      }
    };

    fetchVisitorData();
  }, [currentUser, visitorId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Visitor Details</h1>
        <p>Loading visitor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Visitor Details</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link href="/admin/analytics" className="text-blue-500 hover:underline">
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Visitor Details</h1>
        <p>No visitor data found</p>
        <div className="mt-4">
          <Link href="/admin/analytics" className="text-blue-500 hover:underline">
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  // Format timestamp
  const formattedTime = visitor.timestamp
    ? new Date(visitor.timestamp).toLocaleString()
    : 'Unknown';

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Visitor Details</h1>
        <Link href="/admin/analytics" className="text-blue-500 hover:underline">
          Back to Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <table className="min-w-full">
            <tbody>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Session ID</td>
                <td className="py-2 px-4">{visitor.sessionId}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Timestamp</td>
                <td className="py-2 px-4">{formattedTime}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Local Time</td>
                <td className="py-2 px-4">{visitor.localTime || 'Unknown'}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Page</td>
                <td className="py-2 px-4">{visitor.page}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Referrer</td>
                <td className="py-2 px-4">{visitor.referrer || 'Direct'}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Language</td>
                <td className="py-2 px-4">{visitor.language}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Browser Information */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
          <table className="min-w-full">
            <tbody>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Browser</td>
                <td className="py-2 px-4">{visitor.browserInfo?.browser} {visitor.browserInfo?.version}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Operating System</td>
                <td className="py-2 px-4">{visitor.browserInfo?.os}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Device Type</td>
                <td className="py-2 px-4">{visitor.browserInfo?.mobile ? 'Mobile' : 'Desktop'}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">Screen Size</td>
                <td className="py-2 px-4">{visitor.screenSize?.width} x {visitor.screenSize?.height}</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-4 font-medium">User Agent</td>
                <td className="py-2 px-4 text-xs break-all">{visitor.userAgent}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Location Information</h2>
        {visitor.location ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <table className="min-w-full">
                <tbody>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Country</td>
                    <td className="py-2 px-4">
                      {visitor.location.country}
                      {visitor.location.countryCode && ` (${visitor.location.countryCode})`}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Region</td>
                    <td className="py-2 px-4">
                      {visitor.location.region}
                      {visitor.location.regionCode && ` (${visitor.location.regionCode})`}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">City</td>
                    <td className="py-2 px-4">{visitor.location.city || 'Unknown'}</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">District</td>
                    <td className="py-2 px-4">{visitor.location.district || 'Unknown'}</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Ward</td>
                    <td className="py-2 px-4">{visitor.location.ward || 'Unknown'}</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Street</td>
                    <td className="py-2 px-4">{visitor.location.street || 'Unknown'}</td>
                  </tr>
                </tbody>
              </table>
              <table className="min-w-full">
                <tbody>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Postal Code</td>
                    <td className="py-2 px-4">{visitor.location.postalCode || 'Unknown'}</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Formatted Address</td>
                    <td className="py-2 px-4">{visitor.location.formattedAddress || 'Unknown'}</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Timezone</td>
                    <td className="py-2 px-4">{visitor.location.timezone || 'Unknown'}</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">ISP</td>
                    <td className="py-2 px-4">{visitor.location.isp || 'Unknown'}</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Connection Type</td>
                    <td className="py-2 px-4">{visitor.location.connectionType || 'Unknown'}</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-2 px-4 font-medium">Coordinates</td>
                    <td className="py-2 px-4">
                      {visitor.location.latitude && visitor.location.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${visitor.location.latitude},${visitor.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {visitor.location.latitude}, {visitor.location.longitude}
                        </a>
                      ) : (
                        'Unknown'
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Map */}
            {visitor.location.latitude && visitor.location.longitude && (
              <div className="mt-4 rounded overflow-hidden">
                <h3 className="text-lg font-medium mb-2">Map Location</h3>
                <LocationMap
                  latitude={visitor.location.latitude}
                  longitude={visitor.location.longitude}
                  popupContent={visitor.location.formattedAddress || `${visitor.location.city || ''}, ${visitor.location.region || ''}, ${visitor.location.country || ''}`}
                  height="400px"
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400">No location data available</p>
        )}
      </div>

      {/* Query Parameters */}
      {visitor.queryParams && Object.keys(visitor.queryParams).length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Query Parameters</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-4">Parameter</th>
                <th className="text-left py-2 px-4">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(visitor.queryParams).map(([key, value]) => (
                <tr key={key} className="border-t border-gray-700">
                  <td className="py-2 px-4">{key}</td>
                  <td className="py-2 px-4">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default withAdminProtection(VisitorDetailClient);
