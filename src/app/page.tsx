import Hero from '@/components/Hero';
import OtovoPartnerPromo from '@/components/OtovoPartnerPromo';
import SolarQuoteFormNo from '@/components/SolarQuoteFormNo';
import TrustpilotCarousel from '@/components/TrustpilotCarousel';
import ContactForm from '@/components/ContactForm';
import FAQ from '@/components/FAQ';
import NewsletterHero from '@/components/NewsletterHero';
import { isSolarLeadsEnabled } from '@/lib/solar-leads-enabled';

export default function Home() {
  const solarLeadsEnabled = isSolarLeadsEnabled();

  return (
    <main>
      <Hero />
      {solarLeadsEnabled ? (
        <>
          <OtovoPartnerPromo />
          <SolarQuoteFormNo />
        </>
      ) : null}
      <div className="container" style={{ textAlign: 'center', marginTop: '1rem' }}>
        <h2 style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>Hva våre strømsjefer sier</h2>
      </div>
      <TrustpilotCarousel />
      {/* <PriceCalculator /> */}
      <ContactForm />
      <FAQ />
      <NewsletterHero />
    </main>
  );
}
