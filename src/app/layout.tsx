import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import StyledComponentsRegistry from '../lib/registry';
import BottomNav from '@/components/BottomNav';
import CampaignBanner from '@/components/CampaignBanner';
import GrokChat from '@/components/GrokChat';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import MetaPixel from '@/components/MetaPixel';

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
        {/* Meta Pixel noscript fallback */}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=25319650941056197&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
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
        <CookieConsent />
        <MetaPixel />
      </body>
    </html>
  );
}
