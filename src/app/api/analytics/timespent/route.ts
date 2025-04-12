import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the data directory
const dataDir = path.join(process.cwd(), 'analytics-data');
const timeSpentFile = path.join(dataDir, 'timespent.json');

// Ensure the data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read existing data
async function readTimeSpent() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(timeSpentFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Write data to file
async function writeTimeSpent(data: any[]) {
  await ensureDataDir();
  await fs.writeFile(timeSpentFile, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(request: NextRequest) {
  try {
    const timeSpentData = await request.json();
    
    // Validate required fields
    if (!timeSpentData.page || !timeSpentData.sessionId || timeSpentData.timeSpent === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Add timestamp if not provided
    if (!timeSpentData.timestamp) {
      timeSpentData.timestamp = Date.now();
    }
    
    // Read existing data
    const existingData = await readTimeSpent();
    
    // Add new data
    existingData.push(timeSpentData);
    
    // Write updated data
    await writeTimeSpent(existingData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing time spent data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: GET method to retrieve analytics data (protected in production)
export async function GET() {
  try {
    const data = await readTimeSpent();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving time spent data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
