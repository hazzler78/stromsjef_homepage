import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  // Filesystem access is not available on the Edge runtime.
  return NextResponse.json({ error: 'Loggfilen kan inte läsas i Edge-miljön.' }, { status: 501 });
}