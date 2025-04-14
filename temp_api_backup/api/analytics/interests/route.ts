import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-static";
export const runtime = "edge";
import fs from 'fs/promises';
import path from 'path';

// Define the data directory
const dataDir = path.join(process.cwd(), 'analytics-data');
const interestsFile = path.join(dataDir, 'interests.json');

// Ensure the data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch (_) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read existing data
async function readInterests() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(interestsFile, 'utf8');
    return JSON.parse(data);
  } catch (_) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Write data to file
async function writeInterests(data: Record<string, unknown>[]) {
  await ensureDataDir();
  await fs.writeFile(interestsFile, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(request: NextRequest) {
  try {
    const interestData = await request.json();

    // Validate required fields
    if (!interestData.sessionId || !interestData.interests || !Array.isArray(interestData.interests)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Add timestamp if not provided
    if (!interestData.timestamp) {
      interestData.timestamp = Date.now();
    }

    // Read existing data
    const existingData = await readInterests();

    // Add new data
    existingData.push(interestData);

    // Write updated data
    await writeInterests(existingData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing interest data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: GET method to retrieve analytics data (protected in production)
export async function GET() {
  try {
    const data = await readInterests();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving interest data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
