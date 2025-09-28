import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Start her - Strømsjef.no',
  description: 'Start din strømanalyse og finn det beste strømavtalet for deg.',
  openGraph: {
    title: 'Start her - Strømsjef.no',
    description: 'Start din strømanalyse og finn det beste strømavtalet for deg.',
    url: 'https://stromsjef.no/start-her',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
