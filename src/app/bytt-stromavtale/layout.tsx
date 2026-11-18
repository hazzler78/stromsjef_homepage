import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bytt strømavtale – enkelt og gratis | Strømsjef',
  description: 'Velg spot- eller fastpris og fyll ut bytteskjemaet. Vi guider deg gjennom byttet.',
  openGraph: {
    title: 'Bytt strømavtale | Strømsjef',
    url: 'https://stromsjef.no/bytt-stromavtale',
  },
  alternates: {
    canonical: 'https://stromsjef.no/bytt-stromavtale',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}