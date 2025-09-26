import Hero from '@/components/Hero';
import TrustpilotCarousel from '@/components/TrustpilotCarousel';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import FAQ from '@/components/FAQ';
import NewsletterHero from '@/components/NewsletterHero';

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustpilotCarousel />
      {/* <PriceCalculator /> */}
      <Testimonials />
      <ContactForm />
      <FAQ />
      <NewsletterHero />
    </main>
  );
}
