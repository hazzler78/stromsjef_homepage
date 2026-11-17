import { NextRequest, NextResponse } from 'next/server';

const META_PIXEL_ID = '25319650941056197';

export async function POST(request: NextRequest) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    return NextResponse.json({ skipped: true, reason: 'META_CAPI_TOKEN not configured' });
  }

  try {
    const body = await request.json();
    const {
      eventName,
      eventId,
      eventSourceUrl,
      customData = {},
    } = body as {
      eventName?: string;
      eventId?: string;
      eventSourceUrl?: string;
      customData?: Record<string, unknown>;
    };

    if (!eventName || !eventId) {
      return NextResponse.json({ error: 'eventName and eventId required' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl || request.headers.get('referer') || undefined,
          action_source: 'website',
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
          },
          custom_data: customData,
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Meta CAPI error:', res.status, text.slice(0, 300));
      return NextResponse.json({ success: false, error: 'CAPI request failed' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, meta: data });
  } catch (error) {
    console.error('Meta CAPI error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';