import { NextResponse } from 'next/server';

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ message: 'API routes are disabled in static export mode' });
}

export async function POST() {
  return NextResponse.json({ message: 'API routes are disabled in static export mode' });
}
