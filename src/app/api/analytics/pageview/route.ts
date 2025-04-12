import { NextRequest, NextResponse } from 'next/server';
import { storeAnalyticsData, getAnalyticsData } from '@/lib/analyticsStorage';

export const dynamic = "force-static";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const pageViewData = await request.json();

    // Add timestamp if not provided
    if (!pageViewData.timestamp) {
      pageViewData.timestamp = Date.now();
    }

    // Store the data
    await storeAnalyticsData('pageviews', pageViewData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing page view data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: GET method to retrieve analytics data (protected in production)
export async function GET() {
  try {
    const data = await getAnalyticsData('pageviews');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving page view data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
