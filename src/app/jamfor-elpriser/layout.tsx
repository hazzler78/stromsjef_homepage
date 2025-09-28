import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Sammenlign strømpriser - Finn det beste strømavtalet | Strømsjef',
  description: 'Sammenlign strømpriser fra alle leverandører. Finn det beste strømavtalet for deg og spar penger på strømregningen. Gratis sammenligning og enkel bytteprosess.',
  keywords: 'sammenlign strømpriser, strømpris-sammenligning, billig strøm, strømavtale, strømleverandør, bytte strømavtale',
  openGraph: {
    title: 'Sammenlign strømpriser - Finn det beste strømavtalet',
    description: 'Sammenlign strømpriser fra alle leverandører. Finn det beste strømavtalet for deg og spar penger på strømregningen.',
    url: 'https://stromsjef.no/jamfor-elpriser',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
