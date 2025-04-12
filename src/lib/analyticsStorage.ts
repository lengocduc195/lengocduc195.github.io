/**
 * Helper functions for storing analytics data in Edge Runtime
 * Uses localStorage in browser and memory in server
 */

// In-memory storage for server-side
const memoryStorage: Record<string, any[]> = {
  pageviews: [],
  timespent: [],
  interests: []
};

/**
 * Store data in the appropriate storage mechanism
 */
export async function storeAnalyticsData(type: string, data: any): Promise<void> {
  // Add timestamp if not provided
  if (!data.timestamp) {
    data.timestamp = Date.now();
  }

  // In Edge runtime or server, use memory storage
  memoryStorage[type] = [...(memoryStorage[type] || []), data];
}

/**
 * Retrieve data from the appropriate storage mechanism
 */
export async function getAnalyticsData(type: string): Promise<any[]> {
  // In Edge runtime or server, use memory storage
  return memoryStorage[type] || [];
}
