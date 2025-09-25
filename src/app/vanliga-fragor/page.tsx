import FAQ from '@/components/FAQ';

export const metadata = {
  title: 'Vanlige spørsmål - Strømsjef.se',
  description: 'Svar på vanlige spørsmål om strømavtaler, strømpriser og hvordan du bytter strømleverandør.',
  openGraph: {
    title: 'Vanlige spørsmål - Strømsjef.se',
    description: 'Svar på vanlige spørsmål om strømavtaler, strømpriser og hvordan du bytter strømleverandør.',
  },
};

export default function VanligaFragor() {
  return (
    <main>
      <FAQ />
    </main>
  );
} 