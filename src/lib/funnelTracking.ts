'use client';

import type { UtmParams } from '@/lib/utm';

const UTM_SESSION_KEY = 'stromsjef_utm_v1';
const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

export type FunnelUtm = UtmParams & { utm_content?: string };

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function readCookiePreferences(): { analytics?: boolean; marketing?: boolean } | null {
  if (typeof window === 'undefined') return null;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  const raw = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (consent !== 'accepted' || !raw) return null;
  try {
    return JSON.parse(raw) as { analytics?: boolean; marketing?: boolean };
  } catch {
    return null;
  }
}

export function canTrackMarketing(): boolean {
  const prefs = readCookiePreferences();
  return prefs?.marketing === true;
}

export function canTrackAnalytics(): boolean {
  const prefs = readCookiePreferences();
  return prefs?.analytics === true;
}

/** Persist UTM params from the URL for the session funnel. */
export function captureUtmFromUrl(): FunnelUtm {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const fromUrl: FunnelUtm = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
  try {
    const existing = sessionStorage.getItem(UTM_SESSION_KEY);
    const merged = { ...(existing ? (JSON.parse(existing) as FunnelUtm) : {}), ...Object.fromEntries(
      Object.entries(fromUrl).filter(([, v]) => v)
    ) } as FunnelUtm;
    sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return fromUrl;
  }
}

export function getStoredUtm(): FunnelUtm {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_SESSION_KEY);
    if (raw) return JSON.parse(raw) as FunnelUtm;
  } catch {
    /* ignore */
  }
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

export function appendUtmToSearchParams(params: URLSearchParams, utm: FunnelUtm): void {
  if (utm.utm_source) params.set('utm_source', utm.utm_source);
  if (utm.utm_medium) params.set('utm_medium', utm.utm_medium);
  if (utm.utm_campaign) params.set('utm_campaign', utm.utm_campaign);
  if (utm.utm_content) params.set('utm_content', utm.utm_content);
}

type TrackFunnelOptions = {
  eventId: string;
  utm?: FunnelUtm;
  metaEvent?: string;
  metaParams?: Record<string, unknown>;
  ga4Event?: string;
  ga4Params?: Record<string, unknown>;
  capi?: boolean;
};

export function trackFunnelEvent(options: TrackFunnelOptions): void {
  if (typeof window === 'undefined') return;
  const utm = options.utm ?? getStoredUtm();
  const utmPayload = {
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
  };

  if (options.metaEvent && canTrackMarketing() && typeof window.fbq === 'function') {
    window.fbq('track', options.metaEvent, { ...options.metaParams, ...utmPayload }, {
      eventID: options.eventId,
    });
  }

  if (options.ga4Event && canTrackAnalytics() && typeof window.gtag === 'function') {
    const gaId = process.env.NEXT_PUBLIC_GA4_ID;
    if (gaId) {
      window.gtag('event', options.ga4Event, {
        ...options.ga4Params,
        ...utmPayload,
        event_id: options.eventId,
      });
    }
  }

  if (options.capi !== false && options.metaEvent && canTrackMarketing()) {
    postMetaCapi({
      eventName: options.metaEvent,
      eventId: options.eventId,
      eventSourceUrl: window.location.href,
      customData: { ...options.metaParams, ...utmPayload },
    });
  }
}

const META_CAPI_CLIENT_TIMEOUT_MS = 2500;

/** Never block UI — short client timeout; errors are ignored. */
function postMetaCapi(body: Record<string, unknown>): void {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), META_CAPI_CLIENT_TIMEOUT_MS);
  fetch('/api/events/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
    signal: controller.signal,
  })
    .catch(() => {})
    .finally(() => window.clearTimeout(timer));
}

export const SALESYS_FORM_IDS = {
  rorligt: '68b05450a1479b5cec96958c',
  fastpris: '68b1ea117c19431581b6723a',
} as const;

export function contractTypeFromPlan(bindingTime: number): 'rorligt' | 'fastpris' {
  return bindingTime > 0 ? 'fastpris' : 'rorligt';
}

/** Observe Salesys container for a success / thank-you state. */
export function observeSalesysSuccess(
  containerId: string,
  onSuccess: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  let fired = false;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  const successPattern =
    /(takk for|takk!|thank you|takk skal du ha|bekreftelse|vellykket|mottatt|gratulerer)/i;
  const loadingPattern = /(laster|vent|sender|submitting|spinner|behandler|registrerer)/i;

  const check = () => {
    if (fired) return;
    const text = container.innerText || '';
    if (text.length < 25 || loadingPattern.test(text)) return;
    if (successPattern.test(text)) {
      fired = true;
      window.setTimeout(() => onSuccess(), 0);
    }
  };

  const scheduleCheck = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(check, 400);
  };

  const observer = new MutationObserver(scheduleCheck);
  observer.observe(container, { childList: true, subtree: true, characterData: true });
  scheduleCheck();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    observer.disconnect();
  };
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}