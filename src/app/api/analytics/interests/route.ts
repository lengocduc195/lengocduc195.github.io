import { NextRequest, NextResponse } from 'next/server';
import { storeAnalyticsData, getAnalyticsData } from '@/lib/analyticsStorage';

export const dynamic = "force-static";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const interestData = await request.json();

    // Add timestamp if not provided
    if (!interestData.timestamp) {
      interestData.timestamp = Date.now();
    }

    // Store the data
    await storeAnalyticsData('interests', interestData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing interest data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: GET method to retrieve analytics data (protected in production)
export async function GET() {
  try {
    const data = await getAnalyticsData('interests');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving interest data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
