"use client";

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';
import { inferZoneFromPostalCode } from '@/lib/electricity';
import { createClient } from '@supabase/supabase-js';


const Section = styled.section`
  padding: var(--section-spacing) 0;
`;

const Container = styled.div`
  max-width: 940px;
  margin: 0 auto;
  background: rgba(255,255,255,0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-light);
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
`;

const Lead = styled.p`
  color: var(--gray-700);
  margin-bottom: 1.5rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: end;

  @media (min-width: 640px) {
    grid-template-columns: 1fr auto auto;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 0.95rem;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.1);
  font-size: 1rem;
  background: rgba(255,255,255,0.9);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0,106,167,0.1);
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--gray-700);
`;

const Error = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const Success = styled.div`
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StartHer() {
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const priceZone = useMemo(() => {
    if (postalCode.length >= 4) {
      return inferZoneFromPostalCode(postalCode);
    }
    return null;
  }, [postalCode]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!postalCode || !email) {
        throw new globalThis.Error('Vennligst fyll ut alle felt');
      }

      if (postalCode.length < 4) {
        throw new globalThis.Error('Postnummer må være minst 4 siffer');
      }

      if (!email.includes('@')) {
        throw new globalThis.Error('Vennligst oppgi en gyldig e-postadresse');
      }

      // Logg til Supabase
      const { error: insertError } = await supabase
        .from('form_submissions')
        .insert([
          {
            postal_code: postalCode,
            email: email,
            price_zone: priceZone,
            source: 'start-her',
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        throw new globalThis.Error('Det oppstod en feil. Prøv igjen senere.');
      }

      setSuccess(true);
      setPostalCode('');
      setEmail('');
      
      // Redirect til sammenligning
      setTimeout(() => {
        window.location.href = '/jamfor-elpriser';
      }, 2000);

    } catch (err) {
      setError(err instanceof globalThis.Error ? err.message : 'En feil oppstod');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <Container>
        <Title>Start din strømanalyse</Title>
        <Lead>
          Fyll ut informasjonen nedenfor så hjelper vi deg å finne det beste strømavtalet for din situasjon.
        </Lead>

        <form>
          <div style={{ marginBottom: '1.5rem' }}>
            <Label htmlFor="postalCode">Postnummer</Label>
            <Input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="F.eks. 0123"
              maxLength={4}
            />
            {priceZone && (
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.875rem', 
                color: 'var(--primary)',
                fontWeight: '600'
              }}>
                Strømområde: {priceZone}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <Label htmlFor="email">E-postadresse</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.no"
            />
          </div>

          {error && <Error>{error}</Error>}
          {success && <Success>Takker! Vi sender deg til sammenligning...</Success>}

          <Row>
            <GlassButton
              variant="primary"
              size="lg"
              disabled={loading}
              background={'linear-gradient(135deg, var(--primary), var(--secondary))'}
              onClick={handleSubmit}
            >
              {loading ? 'Analyserer...' : 'Start analyse'}
            </GlassButton>
          </Row>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: 'rgba(0,106,167,0.05)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(0,106,167,0.1)'
        }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Hva skjer videre?
          </h3>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.5rem', 
            color: 'var(--gray-700)',
            lineHeight: '1.6'
          }}>
            <li>Vi analyserer din situasjon basert på postnummer</li>
            <li>Vi viser deg de beste strømavtalene for ditt område</li>
            <li>Vi hjelper deg med å bytte til det beste alternativet</li>
            <li>Vi håndterer hele bytteprosessen for deg</li>
          </ul>
        </div>
      </Container>
    </Section>
  );
}
