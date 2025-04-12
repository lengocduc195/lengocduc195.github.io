import { NextRequest, NextResponse } from 'next/server';
import { storeAnalyticsData, getAnalyticsData } from '@/lib/analyticsStorage';

export const dynamic = "force-static";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const timeSpentData = await request.json();

    // Add timestamp if not provided
    if (!timeSpentData.timestamp) {
      timeSpentData.timestamp = Date.now();
    }

    // Store the data
    await storeAnalyticsData('timespent', timeSpentData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing time spent data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: GET method to retrieve analytics data (protected in production)
export async function GET() {
  try {
    const data = await getAnalyticsData('timespent');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving time spent data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
