import FAQ from '@/components/FAQ';

export const metadata = {
  title: 'Vanlige spørsmål - Strømsjef.no',
  description: 'Svar på vanlige spørsmål om strømavtaler, strømpriser og hvordan du bytter strømleverandør.',
  openGraph: {
    title: 'Vanlige spørsmål - Strømsjef.no',
    description: 'Svar på vanlige spørsmål om strømavtaler, strømpriser og hvordan du bytter strømleverandør.',
    url: 'https://stromsjef.no/vanlige-sporsmal',
  },
};

export default function VanligeSporsmal() {
  return (
    <main>
      <FAQ />
    </main>
  );
}
