import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Bedriftsavtaler for strøm - Strømsjef',
  description: 'Se våre anbefalte leverandører for bedrifter. Ingen postnummer kreves.',
  keywords: 'bedriftsavtaler, strøm bedrift, bedriftsstrøm, strømavtale bedrift, bedriftsleverandør',
  openGraph: {
    title: 'Bedriftsavtaler for strøm - Strømsjef',
    description: 'Se våre anbefalte leverandører for bedrifter. Ingen postnummer kreves.',
    url: 'https://stromsjef.no/bedrift',
    type: 'website',
  },
  alternates: {
    canonical: 'https://stromsjef.no/bedrift',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

