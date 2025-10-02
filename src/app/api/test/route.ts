import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST endpoint is working!', 
    timestamp: new Date().toISOString() 
  });
}
