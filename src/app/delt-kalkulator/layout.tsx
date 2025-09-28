import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Delt kalkulator - Strømsjef.no',
  description: 'Se delte strømkalkuleringer og besparelser fra andre brukere.',
  openGraph: {
    title: 'Delt kalkulator - Strømsjef.no',
    description: 'Se delte strømkalkuleringer og besparelser fra andre brukere.',
    url: 'https://stromsjef.no/delt-kalkulator',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
