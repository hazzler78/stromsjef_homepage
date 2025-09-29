"use client";

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';
import { PriceZone } from '@/lib/electricity';
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
  return `${value.toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} øre/kWh`;
}

type BusinessPlan = {
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
  recommended?: boolean | null;
  sort_order?: number | null;
  price_badge?: string | null;
};

export default function Bedrift() {
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
    if (!supabaseUrl || !supabaseKey) return;
    setLoading(true);
    setError(null);
    const supabase = createClient(supabaseUrl, supabaseKey);
    supabase
      .from('business_electricity_plans')
      .select('*')
      .in('price_zone', [PriceZone.ALL, PriceZone.NO1, PriceZone.NO2, PriceZone.NO3, PriceZone.NO4, PriceZone.NO5])
      .order('binding_time', { ascending: true })
      .order('price_per_kwh', { ascending: true })
      .then(({ data, error }: { data: BusinessPlan[] | null; error: unknown }) => {
        if (error) {
          const msg = (error as { message?: string })?.message || 'Unknown error';
          setError(msg);
          setPlans([]);
          return;
        }
        const safe = (data || []).slice().sort((a, b) => {
          const bindDiff = (Number.isFinite(a.binding_time) ? a.binding_time : 0) - (Number.isFinite(b.binding_time) ? b.binding_time : 0);
          if (bindDiff !== 0) return bindDiff;
          const priceA = Number.isFinite(a.price_per_kwh) ? a.price_per_kwh : Number.POSITIVE_INFINITY;
          const priceB = Number.isFinite(b.price_per_kwh) ? b.price_per_kwh : Number.POSITIVE_INFINITY;
          if (priceA !== priceB) return priceA - priceB;
          return a.supplier_name.localeCompare(b.supplier_name);
        });
        setPlans(safe);
      })
      .then(() => setLoading(false), (e: unknown) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  return (
    <Section>
      <div className="container">
        <Container>
          <Title>Bedriftsavtaler for strøm</Title>
          <Lead>Se våre anbefalte leverandører for bedrifter. Ingen postnummer kreves.</Lead>

          <Plans>
            {loading && <div>Laster…</div>}
            {error && <div style={{ color: '#b91c1c' }}>Feil: {error}</div>}
            {!loading && plans.map(plan => (
              <PlanCard key={plan.id}>
                <Logo className="logo" src={plan.logo_url || '/favicon.svg'} alt={`${plan.supplier_name} logo`} />
                <div className="details">
                  <div style={{ fontWeight: 700 }}>{plan.supplier_name} · {plan.plan_name}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--gray-600)' }}>
                    {plan.binding_time > 0 ? `Bindingstid ${plan.binding_time} mnd` : 'Ingen bindingstid'}
                    {plan.termination_fee ? ` · Bruddgebyr ${plan.termination_fee} kr` : ''}
                    {plan.terms_guarantee ? ` · ${plan.terms_guarantee}` : ''}
                  </div>
                  {plan.guarantee_disclaimer && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>{plan.guarantee_disclaimer}</div>
                  )}
                </div>
                <div className="cta" style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
                  {(plan.recommended || plan.price_badge) && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {plan.recommended && (
                        <span style={{
                          fontWeight: 800,
                          color: '#0b3b2e',
                          background: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
                          border: '1px solid rgba(16,185,129,0.4)',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontSize: '0.8rem'
                        }}>Mest populær</span>
                      )}
                      {plan.price_badge && (
                        <span style={{ fontWeight: 800, color: '#111827' }}>{plan.price_badge}</span>
                      )}
                    </div>
                  )}
                  <div style={{ fontWeight: 800 }}>{formatPrice(plan.price_per_kwh)}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>{plan.monthly_fee === 0 ? '0 kr månedsavgift' : `${plan.monthly_fee} kr/mnd`}</div>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    background="linear-gradient(135deg, var(--secondary), var(--primary))"
                    disableScrollEffect={true}
                    disableHoverEffect={true}
                    onClick={() => {
                      if (plan.affiliate_link) {
                        window.open(plan.affiliate_link, '_blank');
                      }
                    }}
                    aria-label={`Velg ${plan.supplier_name} ${plan.plan_name}`}
                  >
                    Velg avtalen
                  </GlassButton>
                </div>
              </PlanCard>
            ))}
            {!loading && plans.length === 0 && !error && (
              <div style={{ color: 'var(--gray-700)', marginTop: 8 }}>Ingen bedriftsavtaler tilgjengelig akkurat nå.</div>
            )}
          </Plans>
        </Container>
      </div>
    </Section>
  );
}


