import Hero from '@/components/Hero';
import TrustpilotCarousel from '@/components/TrustpilotCarousel';
import ContactForm from '@/components/ContactForm';
import FAQ from '@/components/FAQ';
import NewsletterHero from '@/components/NewsletterHero';

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="container" style={{ textAlign: 'center', marginTop: '1rem' }}>
        <h2 style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>Hva våre kunder sier</h2>
      </div>
      <TrustpilotCarousel />
      {/* <PriceCalculator /> */}
      <ContactForm />
      <FAQ />
      <NewsletterHero />
    </main>
  );
}
