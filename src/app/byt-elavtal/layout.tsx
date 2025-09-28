import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Byt strømavtale - Enkelt og raskt bytte av strømleverandør | Strømsjef',
  description: 'Byt strømavtale enkelt og raskt. Vi håndterer hele bytteprosessen for deg - fra sammenligning til overgang til ny leverandør. Spar penger på strømregningen.',
  keywords: 'byt strømavtale, bytte strømleverandør, strømavtale bytte, bytte strøm, strømleverandør bytte',
  openGraph: {
    title: 'Byt strømavtale - Enkelt og raskt bytte',
    description: 'Byt strømavtale enkelt og raskt. Vi håndterer hele bytteprosessen for deg.',
    url: 'https://stromsjef.no/byt-elavtal',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
