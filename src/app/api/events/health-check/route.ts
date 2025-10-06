import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Missing Supabase environment variables' 
      }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check if analytics tables exist
    const tables = ['banner_impressions', 'hero_impressions', 'banner_clicks', 'hero_clicks'];
    const results: Record<string, string> = {};
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        results[table] = error ? 'missing' : 'exists';
      } catch {
        results[table] = 'error';
      }
    }

    return NextResponse.json({
      status: 'ok',
      supabase: 'connected',
      tables: results
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ 
      status: 'error', 
      message 
    }, { status: 500 });
  }
}

export const runtime = 'edge';
