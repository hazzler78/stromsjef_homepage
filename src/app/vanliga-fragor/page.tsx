import FAQ from '@/components/FAQ';

export const metadata = {
  title: 'Vanliga frågor - Elchef.se',
  description: 'Svar på vanliga frågor om elavtal, elpriser och hur du byter elleverantör.',
  openGraph: {
    title: 'Vanliga frågor - Elchef.se',
    description: 'Svar på vanliga frågor om elavtal, elpriser och hur du byter elleverantör.',
  },
};

export default function VanligaFragor() {
  return (
    <main>
      <FAQ />
    </main>
  );
} 