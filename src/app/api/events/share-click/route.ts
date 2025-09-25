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
    const { platform, logId, savingsAmount, sessionId } = body || {};

    // Validera att platform är en av de tillåtna
    const allowedPlatforms = ['facebook', 'instagram', 'linkedin', 'twitter'];
    if (!allowedPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Ogiltig plattform' }, { status: 400 });
    }

    // Kontrollera att log_id finns i invoice_ocr om det är angivet
    let validLogId = null;
    if (typeof logId === 'number') {
      const { data: logExists } = await supabase
        .from('invoice_ocr')
        .select('id')
        .eq('id', logId)
        .single();
      
      if (logExists) {
        validLogId = logId;
      }
    }

    const { error } = await supabase.from('share_clicks').insert({
      platform: typeof platform === 'string' ? platform : null,
      log_id: validLogId,
      savings_amount: typeof savingsAmount === 'number' ? savingsAmount : null,
      session_id: typeof sessionId === 'string' ? sessionId : null,
      user_agent: ua,
      referer,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Share tracked: ${platform}, logId: ${validLogId}, savings: ${savingsAmount}`);
    return NextResponse.json({ ok: true, logId: validLogId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Okänt fel';
    console.error('Share click tracking error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = 'edge';