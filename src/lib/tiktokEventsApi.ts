/**
 * TikTok Events API - Server-side event tracking
 * Documentation: https://ads.tiktok.com/marketing_api/docs?id=1701890979375106
 */

const TIKTOK_PIXEL_ID = 'D4K2FURC77U10O2JCNVG';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || '';
// Use test event code from env, or default to TEST77286 for testing
const TIKTOK_TEST_EVENT_CODE = process.env.TIKTOK_TEST_EVENT_CODE || (process.env.NODE_ENV === 'development' ? 'TEST77286' : '');

interface TikTokEventProperties {
  event?: string;
  event_id?: string;
  timestamp?: string;
  context?: {
    page?: {
      url?: string;
      referrer?: string;
    };
    user?: {
      external_id?: string;
      phone_number?: string;
      email?: string;
    };
    user_agent?: string;
    ip?: string;
  };
  properties?: Record<string, unknown>;
  test_event_code?: string;
}

interface TikTokEventPayload {
  pixel_code: string;
  event: string;
  event_id?: string;
  timestamp?: string;
  context?: {
    page?: {
      url?: string;
      referrer?: string;
    };
    user?: {
      external_id?: string;
      phone_number?: string;
      email?: string;
    };
    user_agent?: string;
    ip?: string;
  };
  properties?: Record<string, unknown>;
  test_event_code?: string;
}

/**
 * Send an event to TikTok Events API
 */
export async function sendTikTokEvent(
  eventName: string,
  properties: TikTokEventProperties = {}
): Promise<{ success: boolean; error?: string }> {
  // Only send if access token is configured
  if (!TIKTOK_ACCESS_TOKEN) {
    console.warn('TikTok Events API: Access token not configured');
    return { success: false, error: 'Access token not configured' };
  }

  const payload: TikTokEventPayload = {
    pixel_code: TIKTOK_PIXEL_ID,
    event: eventName,
    event_id: properties.event_id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: properties.timestamp || new Date().toISOString(),
    ...(properties.context && { context: properties.context }),
    ...(properties.properties && { properties: properties.properties }),
    // Add test event code if provided (for testing)
    ...(properties.test_event_code && { test_event_code: properties.test_event_code }),
    ...(TIKTOK_TEST_EVENT_CODE && !properties.test_event_code && { test_event_code: TIKTOK_TEST_EVENT_CODE }),
  };

  try {
    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': TIKTOK_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        events: [payload],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TikTok Events API error:', response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    await response.json();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('TikTok Events API request failed:', message);
    return { success: false, error: message };
  }
}

/**
 * Helper to extract user info from request headers
 */
export function getTikTokEventContext(req: {
  headers: {
    get: (name: string) => string | null;
  };
  url?: string;
}): TikTokEventProperties['context'] {
  const userAgent = req.headers.get('user-agent') || '';
  const referer = req.headers.get('referer') || '';
  const url = req.url || '';

  return {
    page: {
      url: url,
      referrer: referer || undefined,
    },
    user_agent: userAgent,
  };
}

