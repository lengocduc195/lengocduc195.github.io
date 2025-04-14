import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-static";
export const runtime = "edge";
import fs from 'fs/promises';
import path from 'path';

// Define the data directory
const dataDir = path.join(process.cwd(), 'analytics-data');
const pageViewsFile = path.join(dataDir, 'pageviews.json');

// Ensure the data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch (_) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read existing data
async function readPageViews() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(pageViewsFile, 'utf8');
    return JSON.parse(data);
  } catch (_) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Write data to file
async function writePageViews(data: Record<string, unknown>[]) {
  await ensureDataDir();
  await fs.writeFile(pageViewsFile, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(request: NextRequest) {
  try {
    const pageViewData = await request.json();

    // Validate required fields
    if (!pageViewData.page || !pageViewData.sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Add timestamp if not provided
    if (!pageViewData.timestamp) {
      pageViewData.timestamp = Date.now();
    }

    // Read existing data
    const existingData = await readPageViews();

    // Add new data
    existingData.push(pageViewData);

    // Write updated data
    await writePageViews(existingData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing page view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: GET method to retrieve analytics data (protected in production)
export async function GET() {
  try {
    const data = await readPageViews();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving page views:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
