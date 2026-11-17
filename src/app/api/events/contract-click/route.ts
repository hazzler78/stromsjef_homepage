import { NextRequest, NextResponse } from 'next/server';
// removed unused createClient
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { sendTikTokEvent, getTikTokEventContext } from '@/lib/tiktokEventsApi';

// Create Supabase client per-request

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contractType,
      logId,
      savingsAmount,
      sessionId,
      source = 'jamfor-elpriser',
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      supplierName,
      planId,
    } = body;

    // Validera att logId finns i invoice_ocr om det är angivet
    let validLogId = null;
    if (typeof logId === 'number') {
      const supabase = getSupabaseServerClient();
      const { data: logExists } = await supabase
        .from('invoice_ocr')
        .select('id')
        .eq('id', logId)
        .single();

      if (logExists) {
        validLogId = logId;
      }
    }

    // Hämta user agent och referer
    const ua = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    // Logga kontraktsklick
    const supabase = getSupabaseServerClient();
    const normalizedType =
      contractType === 'rorligt' || contractType === 'fastpris'
        ? contractType
        : contractType === 'spot' || contractType === 'variable'
          ? 'rorligt'
          : contractType === 'fixed'
            ? 'fastpris'
            : null;

    const sourceLabel =
      typeof source === 'string'
        ? supplierName && typeof supplierName === 'string'
          ? `${source}:${supplierName}`
          : source
        : 'jamfor-elpriser';

    if (!normalizedType) {
      return NextResponse.json({ error: 'Invalid contractType' }, { status: 400 });
    }

    const { error } = await supabase.from('contract_clicks').insert({
      contract_type: normalizedType,
      log_id: validLogId,
      savings_amount: typeof savingsAmount === 'number' ? savingsAmount : null,
      session_id:
        typeof sessionId === 'string'
          ? planId && typeof planId === 'string'
            ? `${sessionId}::${planId}`
            : sessionId
          : null,
      source: sourceLabel,
      utm_source: typeof utmSource === 'string' ? utmSource : null,
      utm_medium: typeof utmMedium === 'string' ? utmMedium : null,
      utm_campaign: typeof utmCampaign === 'string' ? utmCampaign : null,
      user_agent: ua,
      referer: utmContent && typeof utmContent === 'string' ? `${referer} | utm_content=${utmContent}` : referer,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error logging contract click:', error);
      return NextResponse.json({ error: 'Failed to log contract click' }, { status: 500 });
    }

    // Send event to TikTok Events API
    const tiktokContext = getTikTokEventContext(request);
    await sendTikTokEvent('CompletePayment', {
      context: tiktokContext,
      properties: {
        content_type: contractType,
        value: savingsAmount,
        currency: 'NOK',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contract click tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
