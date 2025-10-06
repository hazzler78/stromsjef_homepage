import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ua = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';

    let body = {};
    try {
      body = await req.json();
    } catch (jsonError) {
      console.warn('Failed to parse request body:', jsonError);
    }
    
    const { variant, sessionId } = body as { variant?: string; sessionId?: string };

    // Validate input data
    if (!variant || !['A', 'B'].includes(variant)) {
      console.warn('Invalid variant:', variant);
      return NextResponse.json({ error: 'Invalid variant' }, { status: 400 });
    }

    const { error } = await supabase.from('hero_impressions').insert({
      variant: variant,
      session_id: sessionId || null,
      user_agent: ua,
      referer,
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('Unexpected error in hero-impression:', e);
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = 'edge';


