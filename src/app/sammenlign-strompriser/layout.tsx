import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sammenlign strømpriser – finn riktig avtale | Strømsjef',
  description:
    'Sammenlign strømpriser etter postnummer og velg avtale med bytteskjema på ett sted. Gratis og uforpliktende.',
  openGraph: {
    title: 'Sammenlign strømpriser | Strømsjef',
    description: 'Finn og velg strømavtale for ditt strømområde.',
    url: 'https://stromsjef.no/sammenlign-strompriser',
  },
  alternates: {
    canonical: 'https://stromsjef.no/sammenlign-strompriser',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}