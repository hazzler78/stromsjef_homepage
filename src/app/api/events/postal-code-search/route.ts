import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase env saknas' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ua = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';

    const body = await req.json().catch(() => ({}));
    const { 
      postalCode, 
      priceZone, 
      zoneSource, 
      pagePath, 
      sessionId,
      utmSource,
      utmMedium,
      utmCampaign,
      plansShown,
      clickedPlan,
      clickedSupplier
    } = body || {};

    const { error } = await supabase.from('postal_code_searches').insert({
      postal_code: typeof postalCode === 'string' ? postalCode : null,
      price_zone: typeof priceZone === 'string' ? priceZone : null,
      zone_source: typeof zoneSource === 'string' ? zoneSource : null,
      page_path: typeof pagePath === 'string' ? pagePath : null,
      session_id: typeof sessionId === 'string' ? sessionId : null,
      user_agent: ua,
      referer,
      utm_source: typeof utmSource === 'string' ? utmSource : null,
      utm_medium: typeof utmMedium === 'string' ? utmMedium : null,
      utm_campaign: typeof utmCampaign === 'string' ? utmCampaign : null,
      plans_shown: typeof plansShown === 'number' ? plansShown : null,
      clicked_plan: typeof clickedPlan === 'boolean' ? clickedPlan : false,
      clicked_supplier: typeof clickedSupplier === 'string' ? clickedSupplier : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Okänt fel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = 'edge';
