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
  title: "Strømsjef – Sammenlign og bytt strømavtale enkelt | Gratis strømpris-sammenligning",
  description: "Finn og bytt til det beste strømavtalet for deg. Sammenlign strømpriser fra alle leverandører gratis. Vi håndterer hele byttet for deg - raskt og enkelt.",
  keywords: "strømavtale, strømpriser, bytte strømavtale, sammenlign strømpriser, strømselskap, strømleverandør, billig strøm, strømpris-sammenligning, strømpris sammenligning, strømavtale sammenligning, bytte strømleverandør, strømpris Norge",
  authors: [{ name: "Strømsjef" }],
  creator: "Strømsjef",
  publisher: "Strømsjef",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'no_NO',
    url: 'https://stromsjef.no',
    siteName: 'Strømsjef',
    title: 'Strømsjef – Sammenlign og bytt strømavtale enkelt',
    description: 'Finn og bytt til det beste strømavtalet for deg. Sammenlign strømpriser fra alle leverandører gratis. Vi håndterer hele byttet for deg - raskt og enkelt.',
    images: [
      {
        url: 'https://stromsjef.no/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Strømsjef - logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strømsjef – Sammenlign og bytt strømavtale enkelt',
    description: 'Finn og bytt til det beste strømavtalet for deg. Sammenlign strømpriser fra alle leverandører gratis.',
    images: ['https://stromsjef.no/og-image.png'],
  },
  alternates: {
    canonical: 'https://stromsjef.no',
  },
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
        {/* Primary favicon (SVG) */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Fallbacks for wider browser support */}
        <link rel="icon" sizes="any" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/cheap-logo.png" />
        <script type="application/ld+json" suppressHydrationWarning>{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Strømsjef",
            "url": "https://stromsjef.no",
            "logo": "https://stromsjef.no/cheap-logo.png",
            "description": "Finn og bytt til det beste strømavtalet for deg. Sammenlign strømpriser fra alle leverandører gratis.",
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+46-73-686-23-60",
              "contactType": "customer service",
              "areaServed": "NO",
              "availableLanguage": ["Norwegian", "English"]
            }],
            "sameAs": [
              "https://www.facebook.com/profile.php?id=100070591942605",
              "https://www.instagram.com/stromsjef.no/",
              "https://x.com/Stromsjef",
              "https://www.tiktok.com/@stromsjef"
            ],
            "service": {
              "@type": "Service",
              "name": "Strømpris-sammenligning",
              "description": "Hjelper deg å finne og bytte til det beste strømavtalet",
              "provider": {
                "@type": "Organization",
                "name": "Strømsjef"
              }
            }
          }
        `}</script>
        <meta name="facebook-domain-verification" content="in9xjxefhkl6pbe4g33zjwrsnkliin" />
        <meta property="fb:app_id" content="1552012742628310" />
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
          {/* Minimal Cookiebot adjustments - let it handle its own positioning */}
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
                  
                  // Only set z-index to ensure proper layering, let Cookiebot handle positioning
                  const el = banner as HTMLElement;
                  el.style.zIndex = '1002';
                  
                  // Ensure scrollable content for small screens
                  const content = el.querySelector('.CybotCookiebotDialogBody, .cookieconsent, .cookie-content') as HTMLElement;
                  if (content) {
                    content.style.maxHeight = 'calc(100vh - 120px)';
                    content.style.overflowY = 'auto';
                  }
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
