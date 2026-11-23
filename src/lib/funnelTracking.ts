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
  tiktokEvent?: string;
  tiktokParams?: Record<string, unknown>;
  capi?: boolean;
};

function trackTikTokPixel(event: string, params: Record<string, unknown>): void {
  type TtqStub = {
    track?: (name: string, payload?: Record<string, unknown>) => void;
    push?: (cmd: unknown[]) => void;
  };
  const ttq = (window as Window & { ttq?: TtqStub }).ttq;
  if (!ttq) return;
  const payload = { ...params };
  if (typeof ttq.track === 'function') {
    ttq.track(event, payload);
  } else if (typeof ttq.push === 'function') {
    ttq.push(['track', event, payload]);
  }
}

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

  if (options.tiktokEvent && canTrackMarketing()) {
    trackTikTokPixel(options.tiktokEvent, {
      ...options.tiktokParams,
      ...utmPayload,
      event_id: options.eventId,
    });
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

/** Kilden Kraft offer web form (Bjørnar / Salesys, Nov 2026). */
export const SALESYS_FORM_IDS = {
  kilden: '6a1d7e6052bedbc09493bbcb',
} as const;

/**
 * Active private `product_id_sale` values from
 * https://elifyassets.blob.core.windows.net/offers/kilden-kraft/offers.json
 * (segment=private, status=active). Keyed by offer id slug.
 */
export const SALESYS_PRODUCT_IDS = {
  /** @deprecated Prefer salesysProductIdForKildenPlan — Fastpris 1 år fallback. */
  kilden: '66c4dcdf6953b53b564c3c1c',
  'fastpris-1-ar': '66c4dcdf6953b53b564c3c1c',
  'fastpris-2-ar': '66c4dd496953b53b564c3c1d',
  'fastpris-3-ar': '66c4dd936953b53b564c3c1e',
  'fastpris-avtale': '6a799167bbc759727f2fa3ac',
  'spot-garanti': '661be4e26af5bc6924c4bb4f',
  /** Spotpris 5.9 øre / 59 kr (offers id spotpris-2fa3aa). */
  spotpris: '6a797ff7bbc759727f2fa3aa',
  /** Spotpris 14.9 øre / 35 kr (offers id spot-standard-0c99c5). */
  'spot-standard': '665cdf42e6c3cf2ccf0c99c5',
  'kilden-sesong': '69f87db6baf066358ee7c2e2',
  'kilden-rabatt-6': '698b2df961b509ef4d91d198',
  'kilden-flyttefordel': '6a01aab3baf066358ee7c52a',
} as const;

function normalizePlanLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/\s+/g, ' ');
}

/**
 * Map a Kilden card to Salesys setProduct id.
 * Returns null when the plan has no matching active private offer — callers
 * should fall back to the affiliate link instead of opening the inline form.
 */
export function salesysProductIdForKildenPlan(plan: {
  planName: string;
  bindingTime: number;
}): string | null {
  const name = normalizePlanLabel(plan.planName);
  const months = plan.bindingTime;

  if (/spot\s*garanti/.test(name)) return SALESYS_PRODUCT_IDS['spot-garanti'];
  if (/flyttefordel/.test(name)) return SALESYS_PRODUCT_IDS['kilden-flyttefordel'];
  if (/sesong/.test(name)) return SALESYS_PRODUCT_IDS['kilden-sesong'];
  if (/rabatt/.test(name) && (months === 6 || /\b6\b/.test(name))) {
    return SALESYS_PRODUCT_IDS['kilden-rabatt-6'];
  }

  if (/fastpris/.test(name)) {
    if (/5\s*(ar|aar|år)/.test(plan.planName.toLowerCase()) || months === 60) {
      // Private feed has no Fastpris 5 år — business-only in offers.json.
      return null;
    }
    if (
      /6\s*(mnd|maned|måned)/.test(plan.planName.toLowerCase()) ||
      months === 6
    ) {
      // No private fixed 6-month product_id_sale in the active feed.
      return null;
    }
    if (/3\s*(ar|aar|år)/.test(plan.planName.toLowerCase()) || months === 36) {
      return SALESYS_PRODUCT_IDS['fastpris-3-ar'];
    }
    if (/2\s*(ar|aar|år)/.test(plan.planName.toLowerCase()) || months === 24) {
      return SALESYS_PRODUCT_IDS['fastpris-2-ar'];
    }
    if (/1\s*(ar|aar|år)/.test(plan.planName.toLowerCase()) || months === 12) {
      return SALESYS_PRODUCT_IDS['fastpris-1-ar'];
    }
    if (/avtale/.test(name) || months === 0) {
      return SALESYS_PRODUCT_IDS['fastpris-avtale'];
    }
    return null;
  }

  if (/spot(\s*pris)?/.test(name) || name === 'spot') {
    if (/standard|14[.,]?9/.test(name)) return SALESYS_PRODUCT_IDS['spot-standard'];
    return SALESYS_PRODUCT_IDS.spotpris;
  }

  return null;
}

export function contractTypeFromPlan(bindingTime: number): 'rorligt' | 'fastpris' {
  return bindingTime > 0 ? 'fastpris' : 'rorligt';
}

export function isKildenSupplier(supplierName: string): boolean {
  return /kilden/i.test(supplierName.trim());
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