"use client";

import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface PageView {
  page: string;
  timestamp: number;
  sessionId: string;
  referrer: string;
}

interface TimeSpent {
  page: string;
  timeSpent: number;
  timestamp: number;
  sessionId: string;
}

interface Interest {
  sessionId: string;
  interests: string[];
  timestamp: number;
}

export default function AnalyticsDashboard() {
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [timeSpent, setTimeSpent] = useState<TimeSpent[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch all analytics data
        const [pageViewsRes, timeSpentRes, interestsRes] = await Promise.all([
          fetch('/api/analytics/pageview'),
          fetch('/api/analytics/timespent'),
          fetch('/api/analytics/interests')
        ]);
        
        if (!pageViewsRes.ok || !timeSpentRes.ok || !interestsRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const pageViewsData = await pageViewsRes.json();
        const timeSpentData = await timeSpentRes.json();
        const interestsData = await interestsRes.json();
        
        setPageViews(pageViewsData);
        setTimeSpent(timeSpentData);
        setInterests(interestsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Process page views data for chart
  const pageViewsData = {
    labels: getTopPages(pageViews, 10).map(item => item.page),
    datasets: [
      {
        label: 'Page Views',
        data: getTopPages(pageViews, 10).map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Process time spent data for chart
  const timeSpentData = {
    labels: getTopPagesByTime(timeSpent, 10).map(item => item.page),
    datasets: [
      {
        label: 'Average Time Spent (seconds)',
        data: getTopPagesByTime(timeSpent, 10).map(item => item.avgTime),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  // Process interests data for pie chart
  const interestsData = {
    labels: getTopInterests(interests, 8).map(item => item.interest),
    datasets: [
      {
        label: 'User Interests',
        data: getTopInterests(interests, 8).map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
        ],
      },
    ],
  };

  // Calculate unique visitors
  const uniqueVisitors = new Set(pageViews.map(view => view.sessionId)).size;

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      {loading && <p className="text-center py-8">Loading analytics data...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error: {error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Total Page Views</h2>
              <p className="text-3xl font-bold text-blue-600">{pageViews.length}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Unique Visitors</h2>
              <p className="text-3xl font-bold text-green-600">{uniqueVisitors}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Avg. Time on Site</h2>
              <p className="text-3xl font-bold text-purple-600">
                {calculateAverageTimeOnSite(timeSpent)} sec
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top Pages by Views</h2>
              <div className="h-80">
                <Bar 
                  data={pageViewsData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top Pages by Time Spent</h2>
              <div className="h-80">
                <Bar 
                  data={timeSpentData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">User Interests</h2>
            <div className="h-80 max-w-md mx-auto">
              <Pie 
                data={interestsData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                  },
                }} 
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Visitors</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pageViews.slice(-10).reverse().map((view, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{view.sessionId.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{view.page}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(view.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{view.referrer || 'Direct'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

// Helper functions for data processing

function getTopPages(pageViews: PageView[], limit: number) {
  const pageCounts: Record<string, number> = {};
  
  pageViews.forEach(view => {
    const page = view.page;
    pageCounts[page] = (pageCounts[page] || 0) + 1;
  });
  
  return Object.entries(pageCounts)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function getTopPagesByTime(timeSpent: TimeSpent[], limit: number) {
  const pageTimeMap: Record<string, { total: number, count: number }> = {};
  
  timeSpent.forEach(item => {
    const page = item.page;
    if (!pageTimeMap[page]) {
      pageTimeMap[page] = { total: 0, count: 0 };
    }
    pageTimeMap[page].total += item.timeSpent;
    pageTimeMap[page].count += 1;
  });
  
  return Object.entries(pageTimeMap)
    .map(([page, { total, count }]) => ({ 
      page, 
      avgTime: Math.round(total / count) 
    }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, limit);
}

function getTopInterests(interestsData: Interest[], limit: number) {
  const interestCounts: Record<string, number> = {};
  
  interestsData.forEach(item => {
    item.interests.forEach(interest => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });
  });
  
  return Object.entries(interestCounts)
    .map(([interest, count]) => ({ interest, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function calculateAverageTimeOnSite(timeSpent: TimeSpent[]) {
  if (timeSpent.length === 0) return 0;
  
  const totalTime = timeSpent.reduce((sum, item) => sum + item.timeSpent, 0);
  return Math.round(totalTime / timeSpent.length);
}
