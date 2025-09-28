"use client";

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';
import { ElectricityPlan, PriceZone, inferZoneFromPostalCode } from '@/lib/electricity';
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
  border: 1px solid #ccc;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  transition: border-color 0.2s ease-in-out;

  &:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.85rem 0.95rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  transition: border-color 0.2s ease-in-out;

  &:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
  }
`;

const Plans = styled.div`
  margin-top: 1.5rem;
  display: grid;
  gap: 0.75rem;
`;

const PlanCard = styled.div`
  display: grid;
  grid-template-areas: "logo details cta";
  grid-template-columns: 64px 1fr auto;
  gap: 1rem;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  padding: 0.9rem 1rem;

  .logo { grid-area: logo; }
  .details { grid-area: details; min-width: 0; }
  .cta { grid-area: cta; min-width: 0; }

  @media (max-width: 520px) {
    grid-template-areas:
      "logo cta"
      "details details";
    grid-template-columns: 64px 1fr;
    align-items: center;

    .logo { justify-self: start; align-self: center; }
    .cta { justify-self: end; width: auto; display: grid; justify-items: end; }
    .details { width: 100%; grid-column: 1 / -1; }
  }
`;

const Logo = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
`;

function formatPrice(value: number) {
  // Norwegian format, allow negatives for campaigns like -1.7 øre
  return `${value.toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} øre/kWh`;
}

type ElectricityPlanWithBadge = ElectricityPlan & { priceBadge?: string };

interface DbPlanRow {
  id: string;
  supplier_name: string;
  plan_name: string;
  price_per_kwh: number;
  monthly_fee: number;
  binding_time: number;
  binding_time_text?: string | null;
  terms_guarantee?: string | null;
  guarantee_disclaimer?: string | null;
  termination_fee?: number | null;
  price_zone: string;
  logo_url?: string | null;
  affiliate_link?: string | null;
  featured?: boolean;
  sort_order?: number | null;
  price_badge?: string | null;
}


export default function StartHer() {
  const [postalCode, setPostalCode] = useState('');
  const [zone, setZone] = useState<PriceZone | ''>('');
  const [plans, setPlans] = useState<ElectricityPlanWithBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const inferred = useMemo(() => {
    if (postalCode.length >= 4) {
      return inferZoneFromPostalCode(postalCode);
    }
    return null;
  }, [postalCode]);

  const effectiveZone = (zone || inferred) as PriceZone | undefined;

  useEffect(() => {
    const z = effectiveZone;
    if (!z) return; 
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
    if (!supabaseUrl || !supabaseKey) return;
    setLoading(true);
    setError(null);
    const supabase = createClient(supabaseUrl, supabaseKey);
    supabase
      .from('electricity_plans')
      .select('*')
      .in('price_zone', [z, PriceZone.ALL])
      .order('binding_time', { ascending: true })
      .then(({ data, error }: { data: DbPlanRow[] | null; error: unknown }) => {
        if (error) {
          const msg = (error as { message?: string })?.message || 'Unknown error';
          setError(msg);
          setPlans([]);
          return;
        }
        const mapped: ElectricityPlanWithBadge[] = (data || []).map((r: DbPlanRow) => ({
          id: r.id,
          supplierName: r.supplier_name,
          planName: r.plan_name,
          pricePerKwh: Number(r.price_per_kwh),
          monthlyFee: Number(r.monthly_fee),
          bindingTime: Number(r.binding_time),
          bindingTimeText: r.binding_time_text || undefined,
          termsGuarantee: r.terms_guarantee || undefined,
          guaranteeDisclaimer: r.guarantee_disclaimer || undefined,
          terminationFee: r.termination_fee != null ? Number(r.termination_fee) : undefined,
          priceZone: r.price_zone as PriceZone,
          logoUrl: r.logo_url || undefined,
          affiliateLink: r.affiliate_link || undefined,
          featured: !!r.featured,
          sortOrder: r.sort_order != null ? Number(r.sort_order) : undefined,
          priceBadge: r.price_badge || undefined,
        }));
        // Sort by binding time (lowest to highest)
        setPlans(mapped.sort((a, b) => a.bindingTime - b.bindingTime));
      })
      .then(() => setLoading(false), (e: unknown) => {
        setError(String(e));
        setLoading(false);
      });
  }, [effectiveZone]);

  const filteredPlans = plans;

  // Allow Swedish 5-digit postcodes as well
  const canSearch = postalCode.trim().length >= 4 || zone !== '';

  const handleFind = () => {
    setTouched(true);
    if (!effectiveZone) return;
  };

  return (
    <Section>
      <div className="container">
        <Container>
          <Title>Start her – finn riktig avtale</Title>
          <Lead>Skriv inn ditt norske postnummer, så viser vi bare avtaler i ditt strømområde.</Lead>
          <Row>
            <Input
              inputMode="numeric"
              pattern="\\d{4}"
              placeholder="Postnummer (f.eks. 0150)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              aria-label="Postnummer"
            />
            <Select
              aria-label="Strømområde"
              value={zone}
              onChange={(e) => setZone(e.target.value as PriceZone | '')}
            >
              <option value="">Velg strømområde (valgfritt)</option>
              <option value={PriceZone.ALL}>Alle soner</option>
              <option value={PriceZone.NO1}>NO1 – Øst-Norge</option>
              <option value={PriceZone.NO2}>NO2 – Sør-Norge</option>
              <option value={PriceZone.NO3}>NO3 – Midt-Norge</option>
              <option value={PriceZone.NO4}>NO4 – Nord-Norge</option>
              <option value={PriceZone.NO5}>NO5 – Vest-Norge</option>
            </Select>
            <div>
              <GlassButton
                variant="primary"
                size="md"
                background="linear-gradient(135deg, var(--primary), var(--secondary))"
                disableScrollEffect={true}
                disableHoverEffect={true}
                onClick={handleFind}
                aria-label="Vis avtaler"
                className={canSearch ? '' : 'disabled'}
              >
                Vis mine avtaler
              </GlassButton>
            </div>
          </Row>

          {touched && !effectiveZone && (
            <p style={{ color: '#b91c1c', marginTop: '0.75rem' }}>
              Klarte ikke å fastslå strømområde. Velg område i listen for å fortsette.
            </p>
          )}

          {effectiveZone && (
            <div style={{ marginTop: '1rem', color: 'var(--gray-700)' }}>
              Viser avtaler for <strong>{effectiveZone}</strong>{inferred && !zone ? ' (fra postnummer)' : ''} (inkl. Alle soner).
            </div>
          )}

          <Plans>
            {loading && <div>Laster…</div>}
            {error && <div style={{ color: '#b91c1c' }}>Feil: {error}</div>}
            {effectiveZone && filteredPlans.map(plan => (
              <PlanCard key={plan.id}>
                <Logo className="logo" src={plan.logoUrl || '/favicon.svg'} alt={`${plan.supplierName} logo`} />
                <div className="details">
                  <div style={{ fontWeight: 700 }}>{plan.supplierName} · {plan.planName}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--gray-600)' }}>
                    {plan.bindingTime > 0 ? `Bindingstid ${plan.bindingTime} mnd` : 'Ingen bindingstid'}
                    {plan.terminationFee ? ` · Bruddgebyr ${plan.terminationFee} kr` : ''}
                    {plan.termsGuarantee ? ` · ${plan.termsGuarantee}` : ''}
                  </div>
                  {plan.guaranteeDisclaimer && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>{plan.guaranteeDisclaimer}</div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 6 }}>
                    Avtalen forutsetter godkjent kredittvurdering. Avtaler kan sammenlignes med andre avtaler på {""}
                    <a href="http://strompris.no" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>forbrukerrådets strømprisportal</a>.
                  </div>
                </div>
                <div className="cta" style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
                  {plan.priceBadge && (
                    <div style={{ fontWeight: 800, color: '#111827' }}>{plan.priceBadge}</div>
                  )}
                  <div style={{ fontWeight: 800 }}>{formatPrice(plan.pricePerKwh)}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>{plan.monthlyFee === 0 ? '0 kr månedsavgift' : `${plan.monthlyFee} kr/mnd`}</div>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    background="linear-gradient(135deg, var(--secondary), var(--primary))"
                    disableScrollEffect={true}
                    disableHoverEffect={true}
                    onClick={() => {
                      if (plan.affiliateLink) {
                        window.open(plan.affiliateLink, '_blank');
                      }
                    }}
                    aria-label={`Velg ${plan.supplierName} ${plan.planName}`}
                  >
                    Velg avtalen
                  </GlassButton>
                </div>
              </PlanCard>
            ))}
            {effectiveZone && !loading && filteredPlans.length === 0 && (
              <div style={{ color: 'var(--gray-700)', marginTop: 8 }}>Ingen avtale for valgt område akkurat nå.</div>
            )}
          </Plans>
        </Container>
      </div>
    </Section>
  );
}