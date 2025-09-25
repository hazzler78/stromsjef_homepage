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
  title: "Elchef – gör det enkelt att välja rätt elavtal",
  description: "Elchef.se hjälper dig att snabbt, gratis och utan krångel hitta och byta till det elavtal som passar dig bäst. Vi visar bara elavtal som är värda att överväga och sköter hela bytet åt dig.",
  keywords: "elavtal, elpriser, byta elavtal, jämför elpriser, elbolag, elhandelsbolag",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <head>
        <Script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="adbd0838-8684-44d4-951e-f4eddcb600cc" data-blockingmode="auto" strategy="beforeInteractive" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script type="application/ld+json" suppressHydrationWarning>{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Elchef",
            "url": "https://elchef.se",
            "logo": "https://elchef.se/logo.png",
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+46-73-686-23-66",
              "contactType": "customer service",
              "areaServed": "SE",
              "availableLanguage": ["Swedish", "English"]
            }],
            "sameAs": [
              "https://www.facebook.com/elchef.se",
              "https://www.instagram.com/elchef.se/"
            ]
          }
        `}</script>
        {/* Open Graph metadata */}
        <meta property="og:title" content="Elchef – gör det enkelt att välja rätt elavtal" />
        <meta property="og:description" content="Elchef.se hjälper dig att snabbt, gratis och utan krångel hitta och byta till det elavtal som passar dig bäst. Vi visar bara elavtal som är värda att överväga och sköter hela bytet åt dig." />
        <meta property="og:image" content="https://elchef.se/og-image.png" />
        <meta property="og:url" content="https://elchef.se" />
        <meta property="og:type" content="website" />
        {/* Twitter Card metadata */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Elchef – gör det enkelt att välja rätt elavtal" />
        <meta name="twitter:description" content="Elchef.se hjälper dig att snabbt, gratis och utan krångel hitta och byta till det elavtal som passar dig bäst. Vi visar bara elavtal som är värda att överväga och sköter hela bytet åt dig." />
        <meta name="twitter:image" content="https://elchef.se/og-image.png" />
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
