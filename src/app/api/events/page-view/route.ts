import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      // On Cloudflare Pages preview/production, env vars might not be present; avoid spamming 500s
      return NextResponse.json({ ok: true, note: 'Supabase ej konfigurerat i denna miljö' }, { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ua = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';

    const body = await req.json().catch(() => ({}));
    const { path, sessionId, utmSource, utmMedium, utmCampaign } = body || {};

    const { error } = await supabase.from('page_views').insert({
      path: typeof path === 'string' ? path : null,
      session_id: typeof sessionId === 'string' ? sessionId : null,
      utm_source: typeof utmSource === 'string' ? utmSource : null,
      utm_medium: typeof utmMedium === 'string' ? utmMedium : null,
      utm_campaign: typeof utmCampaign === 'string' ? utmCampaign : null,
      user_agent: ua,
      referer
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Okänt fel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = 'edge';


