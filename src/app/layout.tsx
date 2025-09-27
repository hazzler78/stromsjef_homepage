import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import StyledComponentsRegistry from '../lib/registry';
import BottomNav from '@/components/BottomNav';
import CampaignBanner from '@/components/CampaignBanner';
import GrokChat from '@/components/GrokChat';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strømsjef – gjør det enkelt å velge riktig strømavtale",
  description: "Strømsjef.se hjelper deg å raskt, gratis og uten krøll finne og bytte til det strømavtale som passer deg best. Vi viser bare avtaler som er verdt å vurdere og håndterer hele byttet for deg.",
  keywords: "strømavtale, strømpriser, bytte strømavtale, sammenlign strømpriser, strømselskap, strømhandelselskap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        <Script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="adbd0838-8684-44d4-951e-f4eddcb600cc" data-blockingmode="auto" strategy="beforeInteractive" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script type="application/ld+json" suppressHydrationWarning>{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Strømsjef",
            "url": "https://stromsjef.se",
            "logo": "https://stromsjef.se/logo.png",
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+46-73-686-23-60",
              "contactType": "customer service",
              "areaServed": "NO",
              "availableLanguage": ["Norwegian", "English"]
            }],
            "sameAs": [
              "https://www.facebook.com/stromsjef.se",
              "https://www.instagram.com/stromsjef.se/"
            ]
          }
        `}</script>
        {/* Open Graph metadata */}
        <meta property="og:title" content="Strømsjef – gjør det enkelt å velge riktig strømavtale" />
        <meta property="og:description" content="Strømsjef.se hjelper deg å raskt, gratis og uten krøll finne og bytte til det strømavtale som passer deg best. Vi viser bare avtaler som er verdt å vurdere og håndterer hele byttet for deg." />
        <meta property="og:image" content="https://stromsjef.se/og-image.png" />
        <meta property="og:url" content="https://stromsjef.se" />
        <meta property="og:type" content="website" />
        {/* Twitter Card metadata */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Strømsjef – gjør det enkelt å velge riktig strømavtale" />
        <meta name="twitter:description" content="Strømsjef.se hjelper deg å raskt, gratis og uten krøll finne og bytte til det strømavtale som passer deg best. Vi viser bare avtaler som er verdt å vurdere og håndterer hele byttet for deg." />
        <meta name="twitter:image" content="https://stromsjef.se/og-image.png" />
        <meta name="facebook-domain-verification" content="in9xjxefhkl6pbe4g33zjwrsnkliin" />
        <meta name="tiktok-developers-site-verification" content="i7h859t0QF0G6Dua8q4h9qJUXwuPQoof" />
      </head>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          {/* Tracks and stores affiliate code from query params in a cookie */}
          <Script id="affiliate-tracker" strategy="afterInteractive">
            {`
              (function(){
                try {
                  var params = new URLSearchParams(window.location.search);
                  var ref = params.get('ref') || params.get('utm_source');
                  var campaign = params.get('code') || params.get('kampanj') || params.get('utm_campaign');
                  if (ref) {
                    var expires = new Date();
                    expires.setDate(expires.getDate() + 30);
                    document.cookie = 'elchef_affiliate=' + encodeURIComponent(ref) + '; path=/; expires=' + expires.toUTCString() + '; SameSite=Lax';
                  }
                  if (campaign) {
                    var expires2 = new Date();
                    expires2.setDate(expires2.getDate() + 30);
                    document.cookie = 'elchef_campaign=' + encodeURIComponent(campaign) + '; path=/; expires=' + expires2.toUTCString() + '; SameSite=Lax';
                  }
                } catch (e) { /* noop */ }
              })();
            `}
          </Script>
          {/* Ensure Cookiebot banner sits above bottom nav and chat bubble */}
          <Script id="cookiebot-adjust" strategy="afterInteractive">{
            `(() => {
              function isVisible(el){
                if(!el) return false;
                const style = window.getComputedStyle(el);
                if(style.display==='none' || style.visibility==='hidden' || style.opacity==='0') return false;
                const rect = el.getBoundingClientRect();
                return rect.height > 0 && rect.width > 0;
              }
              function adjust(){
                try{
                  const banner = document.querySelector('#CybotCookiebotDialog, [id^="CybotCookiebot"], #CookiebotDialog, .CookieConsent, .CookiebotWidget, #CookieConsent, #CookieDeclaration, .cookieconsent, .cookie-declaration');
                  if(!banner || !isVisible(banner)) return;
                  const nav = document.querySelector('[data-bottom-nav="true"]');
                  const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
                  const chatBtn = document.querySelector('[aria-label="Åpne chat"], [aria-label="Lukk chat"]');
                  const chatSize = chatBtn ? Math.max(chatBtn.clientHeight, 56) : 56;
                  const gap = 20;
                  const newBottom = navHeight + chatSize + gap;
                  const el = banner;
                  const style = (el as HTMLElement).style as CSSStyleDeclaration;
                  style.position = 'fixed';
                  style.bottom = newBottom + 'px';
                  style.zIndex = '1002';
                }catch{}
              }
              adjust();
              window.addEventListener('resize', adjust);
              const obs = new MutationObserver(adjust);
              obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style','class'] });
            })();`}
          </Script>
          <CampaignBanner />
          <div id="app">
            {children}
            <BottomNav />
            <Footer />
          </div>
        </StyledComponentsRegistry>
        <GrokChat />
      </body>
    </html>
  );
}
