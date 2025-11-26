"use client";

import { useEffect } from 'react';

const TIKTOK_PIXEL_ID = 'D4JLVOBC77UBCCH9E2IG';

declare global {
  interface Window {
    ttq?: unknown;
    TiktokAnalyticsObject?: string;
  }
}

// Initialize TikTok Pixel script
function initTikTokPixel() {
  if (typeof window === 'undefined') return;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.ttq) return;

  // TikTok Pixel initialization code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (function(w: any, d: Document, t: string) {
    w.TiktokAnalyticsObject = t;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ttq: any = w[t] = w[t] || [];
    ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ttq.setAndDefer = function(t: any, e: string) {
      t[e] = function(...args: unknown[]) {
        t.push([e].concat(args));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.instance = function(t: string) {
      const e = ttq._i[t] || [];
      for (let n = 0; n < ttq.methods.length; n++) {
        ttq.setAndDefer(e, ttq.methods[n]);
      }
      return e;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ttq.load = function(e: string, n?: any) {
      const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = r;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      const script = d.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = r + "?sdkid=" + e + "&lib=" + t;
      const firstScript = d.getElementsByTagName("script")[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    };

    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
  })(w, document, 'ttq');
}

// Check if marketing cookies are accepted
function shouldLoadPixel(): boolean {
  if (typeof window === 'undefined') return false;
  
  const consent = localStorage.getItem('cookie_consent');
  const preferences = localStorage.getItem('cookie_preferences');
  
  if (consent === 'accepted' && preferences) {
    try {
      const prefs = JSON.parse(preferences);
      return prefs.marketing === true;
    } catch {
      return false;
    }
  }
  return false;
}

export default function TikTokPixel() {
  useEffect(() => {
    // Check and initialize on mount
    if (shouldLoadPixel()) {
      initTikTokPixel();
    }

    // Listen for cookie consent changes
    const handleCookieChange = () => {
      if (shouldLoadPixel()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (!w.ttq) {
          initTikTokPixel();
        }
      } else {
        // Optionally disable tracking if consent is revoked
        // Note: TikTok Pixel doesn't have a built-in disable method
        // You may want to clear cookies or use TikTok's opt-out
      }
    };

    // Listen for storage changes (cookie consent updates)
    window.addEventListener('storage', handleCookieChange);
    
    // Also listen for custom event from CookieConsent component
    window.addEventListener('cookieConsentChanged', handleCookieChange);

    return () => {
      window.removeEventListener('storage', handleCookieChange);
      window.removeEventListener('cookieConsentChanged', handleCookieChange);
    };
  }, []);

  return null;
}

// Export function to initialize pixel (for use in CookieConsent)
export function initializeTikTokPixel() {
  if (shouldLoadPixel()) {
    initTikTokPixel();
  }
}

