'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GlassButton from '@/components/GlassButton';
import { withDefaultCtaUtm } from '@/lib/utm';

interface SharedCalculation {
  id: string;
  savingsAmount: number;
  analysisDate: string;
  platform: string;
  isAnonymous: boolean;
}


function DeltKalkulatorContent() {
  const [calculation, setCalculation] = useState<SharedCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const calculationId = searchParams.get('id');

  useEffect(() => {
    if (calculationId) {
      // Här skulle du hämta kalkyldata från din databas
      // För nu simulerar vi data
      setTimeout(() => {
        setCalculation({
          id: calculationId,
          savingsAmount: 2400,
          analysisDate: new Date().toISOString(),
          platform: 'facebook',
          isAnonymous: true
        });
        setLoading(false);
      }, 1000);
    } else {
      setError('Ingen kalkulator funnet');
      setLoading(false);
    }
  }, [calculationId]);

  if (loading) {
    return (
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'var(--glass-blur)', 
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--glass-shadow-light)'
        }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Laster kalkulator...</h1>
          <p style={{ color: 'var(--gray-600)' }}>Vennligst vent mens vi henter dataene.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'var(--glass-blur)', 
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--glass-shadow-light)'
        }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Kalkulator ikke funnet</h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>{error}</p>
          <GlassButton
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/'}
            background={'linear-gradient(135deg, var(--primary), var(--secondary))'}
          >
            Tilbake til startsiden
          </GlassButton>
        </div>
      </main>
    );
  }

  if (!calculation) {
    return (
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'var(--glass-blur)', 
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--glass-shadow-light)'
        }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Ingen kalkulator funnet</h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>Denne kalkulatoren eksisterer ikke eller er ikke tilgjengelig.</p>
          <GlassButton
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/'}
            background={'linear-gradient(135deg, var(--primary), var(--secondary))'}
          >
            Tilbake til startsiden
          </GlassButton>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
      <div style={{ 
        background: 'var(--glass-bg)', 
        backdropFilter: 'var(--glass-blur)', 
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: 'var(--glass-shadow-light)'
      }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Delt strømkalkulator</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
          Se hvor mye denne personen sparer på strømregningen!
        </p>
        
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          boxShadow: 'var(--glass-shadow-heavy)'
        }}>
          <h2 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
            {calculation.savingsAmount.toLocaleString('no-NO')} kr
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
            Årlig besparelse på strømregningen
          </p>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Kalkulatordetaljer</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
            <div>
              <strong>Kalkulator ID:</strong><br />
              <span style={{ color: 'var(--gray-600)' }}>{calculation.id}</span>
            </div>
            <div>
              <strong>Analysedato:</strong><br />
              <span style={{ color: 'var(--gray-600)' }}>
                {new Date(calculation.analysisDate).toLocaleDateString('no-NO')}
              </span>
            </div>
            <div>
              <strong>Plattform:</strong><br />
              <span style={{ color: 'var(--gray-600)', textTransform: 'capitalize' }}>
                {calculation.platform}
              </span>
            </div>
            <div>
              <strong>Anonym:</strong><br />
              <span style={{ color: 'var(--gray-600)' }}>
                {calculation.isAnonymous ? 'Ja' : 'Nei'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Vil du også spare penger?</h3>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
            Få din egen strømanalyse og se hvor mye du kan spare på strømregningen.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <GlassButton
            variant="primary"
            size="lg"
            onClick={() => window.location.href = withDefaultCtaUtm('/jamfor-elpriser')}
            background={'linear-gradient(135deg, var(--primary), var(--secondary))'}
          >
            Start din egen analyse
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            size="lg"
            onClick={() => window.location.href = '/'}
            background={'rgba(255,255,255,0.1)'}
          >
            Tilbake til startsiden
          </GlassButton>
        </div>
      </div>
    </main>
  );
}

export default function DeltKalkulator() {
  return (
    <Suspense fallback={
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'var(--glass-blur)', 
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--glass-shadow-light)'
        }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Laster...</h1>
        </div>
      </main>
    }>
      <DeltKalkulatorContent />
    </Suspense>
  );
}
