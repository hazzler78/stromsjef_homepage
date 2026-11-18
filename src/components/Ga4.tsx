'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

function readAnalyticsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem('cookie_consent');
  const raw = localStorage.getItem('cookie_preferences');
  if (consent !== 'accepted' || !raw) return false;
  try {
    const prefs = JSON.parse(raw) as { analytics?: boolean };
    return prefs.analytics === true;
  } catch {
    return false;
  }
}

export function initializeGa4(): void {
  if (!GA4_ID || typeof window === 'undefined') return;
  if (!readAnalyticsAllowed()) return;
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: true });
}

export default function Ga4() {
  useEffect(() => {
    if (readAnalyticsAllowed()) {
      initializeGa4();
    }
    const onConsent = () => {
      if (readAnalyticsAllowed()) initializeGa4();
    };
    window.addEventListener('cookieConsentChanged', onConsent);
    window.addEventListener('storage', onConsent);
    return () => {
      window.removeEventListener('cookieConsentChanged', onConsent);
      window.removeEventListener('storage', onConsent);
    };
  }, []);

  if (!GA4_ID) return null;

  return (
    <>
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          if (readAnalyticsAllowed()) initializeGa4();
        }}
      />
    </>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}