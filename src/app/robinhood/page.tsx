'use client';

import { useEffect } from 'react';

const DEFAULT_UTM = {
  utm_source: 'hampus',
  utm_medium: 'share',
  utm_campaign: 'robinhood',
} as const;

/**
 * Hampus delningslänk (Norge): https://stromsjef.no/robinhood
 * - Merker came_via_robinhood (samme nøkkel som svenska sidan)
 * - Logger besøket til page_views med UTM
 * - Sender besøkende til /jamfor-elpriser med UTM så Hampus-trafikken kan måles
 */
export default function RobinhoodPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('came_via_robinhood', 'true');
      localStorage.setItem('came_via_robinhood_time', Date.now().toString());
    } catch { /* ignore */ }

    // Samme session-nøkkel som /jamfor-elpriser bruker
    let sid = '';
    try {
      sid = localStorage.getItem('invoiceSessionId') || '';
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('invoiceSessionId', sid);
      }
    } catch { /* ignore */ }

    const trackClick = () => {
      try {
        const payload = JSON.stringify({
          path: '/robinhood',
          sessionId: sid,
          utmSource: DEFAULT_UTM.utm_source,
          utmMedium: DEFAULT_UTM.utm_medium,
          utmCampaign: DEFAULT_UTM.utm_campaign,
        });
        const url = '/api/events/page-view';
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch { /* ignore */ }
    };

    // Bygg mål-URL: /jamfor-elpriser med Hampus-UTM (behold eventuelle innkommende parametre)
    const incoming = new URLSearchParams(window.location.search);
    const dest = new URL('/jamfor-elpriser', window.location.origin);
    for (const [key, value] of Object.entries(DEFAULT_UTM)) {
      dest.searchParams.set(key, value);
    }
    incoming.forEach((value, key) => {
      if (value) dest.searchParams.set(key, value);
    });
    if (!dest.searchParams.get('utm_source')) {
      dest.searchParams.set('utm_source', DEFAULT_UTM.utm_source);
    }
    if (!dest.searchParams.get('utm_medium')) {
      dest.searchParams.set('utm_medium', DEFAULT_UTM.utm_medium);
    }
    if (!dest.searchParams.get('utm_campaign')) {
      dest.searchParams.set('utm_campaign', DEFAULT_UTM.utm_campaign);
    }

    trackClick();
    window.location.replace(dest.pathname + dest.search);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <p>Omdirigerer…</p>
    </div>
  );
}
