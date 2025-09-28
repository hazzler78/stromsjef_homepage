import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Om oss - Strømsjef | Din strømpris-ekspert',
  description: 'Lær mer om Strømsjef og vårt team. Vi hjelper deg å finne det beste strømavtalet og bytte enkelt og raskt. Gratis tjeneste for alle.',
  keywords: 'om strømsjef, strømpris-ekspert, strømavtale-hjelp, strømleverandør-sammenligning',
  openGraph: {
    title: 'Om oss - Strømsjef',
    description: 'Lær mer om Strømsjef og vårt team. Vi hjelper deg å finne det beste strømavtalet.',
    url: 'https://stromsjef.no/om-oss',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
