"use client";

import { useEffect } from 'react';

const META_PIXEL_ID = '25319650941056197';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

// Initialize Meta Pixel script
function initMetaPixel() {
  if (typeof window === 'undefined' || window.fbq) return;

  (function(f: Window, b: Document, e: string, v: string) {
    if ((f as unknown as { fbq?: unknown }).fbq) return;
    const n = (f as unknown as { fbq?: unknown }).fbq = function(...args: unknown[]) {
      const nCallMethod = (n as { callMethod?: unknown }).callMethod;
      if (nCallMethod) {
        nCallMethod.apply(n, args);
      } else {
        ((n as { queue?: unknown[] }).queue = (n as { queue?: unknown[] }).queue || []).push(args);
      }
    };
    if (!(f as unknown as { _fbq?: unknown })._fbq) {
      (f as unknown as { _fbq?: unknown })._fbq = n;
    }
    (n as { push?: unknown }).push = n;
    (n as { loaded?: boolean }).loaded = true;
    (n as { version?: string }).version = '2.0';
    (n as { queue?: unknown[] }).queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    }
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  // Initialize and track PageView
  // The fbq function queues calls if the script hasn't loaded yet
  if (window.fbq) {
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
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

export default function MetaPixel() {
  useEffect(() => {
    // Check and initialize on mount
    if (shouldLoadPixel()) {
      initMetaPixel();
    }

    // Listen for cookie consent changes
    const handleCookieChange = () => {
      if (shouldLoadPixel() && !window.fbq) {
        initMetaPixel();
      } else if (!shouldLoadPixel() && window.fbq) {
        // Optionally disable tracking if consent is revoked
        // Note: Meta Pixel doesn't have a built-in disable method
        // You may want to clear cookies or use Facebook's opt-out
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
export function initializeMetaPixel() {
  if (shouldLoadPixel()) {
    initMetaPixel();
  }
}

