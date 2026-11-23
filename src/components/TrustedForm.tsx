'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { canTrackMarketing } from '@/lib/funnelTracking';
import { initTrustedFormScript } from '@/lib/trustedFormClient';
import { isLeadFormPage } from '@/lib/trustedFormPaths';

function shouldLoadTrustedForm(pathname: string): boolean {
  return isLeadFormPage(pathname) && canTrackMarketing();
}

export function initializeTrustedForm(): void {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (shouldLoadTrustedForm(path)) {
    initTrustedFormScript();
  }
}

export default function TrustedForm() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    if (shouldLoadTrustedForm(pathname)) {
      initTrustedFormScript();
    }

    const onConsentChange = () => {
      if (shouldLoadTrustedForm(pathname)) {
        initTrustedFormScript();
      }
    };

    window.addEventListener('cookieConsentChanged', onConsentChange);
    window.addEventListener('storage', onConsentChange);
    return () => {
      window.removeEventListener('cookieConsentChanged', onConsentChange);
      window.removeEventListener('storage', onConsentChange);
    };
  }, [pathname]);

  if (!isLeadFormPage(pathname)) return null;

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://api.trustedform.com/ns.gif" alt="" width={1} height={1} />
    </noscript>
  );
}