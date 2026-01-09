"use client";

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';
import { ElectricityPlan, PriceZone, inferZoneFromPostalCode, getSupplierLogoUrl } from '@/lib/electricity';
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
  border: 1px solid #dbe2ea;
  font-size: 1rem;
  background: #fff;
`;

const Select = styled.select`
  padding: 0.8rem 0.95rem;
  border-radius: 10px;
  border: 1px solid #dbe2ea;
  background: #fff;
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

type ElectricityPlanWithBadge = ElectricityPlan & { priceBadge?: string; recommended?: boolean };

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
  price_zone: PriceZone;
  logo_url?: string | null;
  affiliate_link?: string | null;
  featured?: boolean | null;
  sort_order?: number | null;
  price_badge?: string | null;
  recommended?: boolean | null;
}

// Generera session ID
function generateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const stored = sessionStorage.getItem('postal_search_session_id');
  if (stored) return stored;
  const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  sessionStorage.setItem('postal_search_session_id', newId);
  return newId;
}

// Hämta UTM-parametrar från URL
function getUtmParams() {
  if (typeof window === 'undefined') return { utmSource: null, utmMedium: null, utmCampaign: null };
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
  };
}

export default function StartaHar() {
  const [postalCode, setPostalCode] = useState('');
  const [zone, setZone] = useState<PriceZone | ''>('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<ElectricityPlanWithBadge[]>([]);
  const [sessionId] = useState(() => generateSessionId());
  const [hasTrackedSearch, setHasTrackedSearch] = useState(false);

  const inferred = useMemo(() => (postalCode.trim().length >= 4 ? inferZoneFromPostalCode(postalCode) : undefined), [postalCode]);

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
      .then(({ data, error }: { data: DbPlanRow[] | null; error: unknown }) => {
        if (error) {
          const msg = (error as { message?: string })?.message || 'Unknown error';
          setError(msg);
          setPlans([]);
          return;
        }
        // Helpers to safely parse numeric values from DB (handles strings like "4,40")
        const parseNumber = (value: unknown, fallback: number): number => {
          if (typeof value === 'number' && Number.isFinite(value)) return value;
          if (typeof value === 'string') {
            const normalized = value.replace(',', '.');
            const n = Number(normalized);
            return Number.isFinite(n) ? n : fallback;
          }
          return fallback;
        };

        const mapped: ElectricityPlanWithBadge[] = (data || []).map((r: DbPlanRow) => ({
          id: r.id,
          supplierName: r.supplier_name,
          planName: r.plan_name,
          pricePerKwh: parseNumber(r.price_per_kwh, Number.POSITIVE_INFINITY),
          monthlyFee: parseNumber(r.monthly_fee, 0),
          // Treat missing binding time as 0 (ingen bindingstid)
          bindingTime: parseNumber(r.binding_time, 0),
          bindingTimeText: r.binding_time_text || undefined,
          termsGuarantee: r.terms_guarantee || undefined,
          guaranteeDisclaimer: r.guarantee_disclaimer || undefined,
          terminationFee: r.termination_fee != null ? Number(r.termination_fee) : undefined,
          priceZone: r.price_zone,
          logoUrl: r.logo_url || getSupplierLogoUrl(r.supplier_name),
          affiliateLink: r.affiliate_link || undefined,
          featured: !!r.featured,
          recommended: !!r.recommended,
          sortOrder: r.sort_order != null ? Number(r.sort_order) : undefined,
          priceBadge: r.price_badge || undefined,
        }));
        // Debug: Log the data before sorting
        console.log('Plans before sorting:', mapped.map(p => ({
          supplier: p.supplierName,
          plan: p.planName,
          bindingTime: p.bindingTime,
          price: p.pricePerKwh,
          sortOrder: p.sortOrder
        })));
        
        // Sort by recommended/featured first, then sort_order, then binding time, price, and supplier name
        const sorted = mapped.sort((a, b) => {
          // 1) Recommended first (true before false)
          if (a.recommended !== b.recommended) {
            return a.recommended ? -1 : 1;
          }
          
          // 2) Featured second (true before false)
          if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
          }
          
          // 3) Sort order third (nulls last - items without sort_order go to bottom)
          const sortA = a.sortOrder ?? Number.POSITIVE_INFINITY;
          const sortB = b.sortOrder ?? Number.POSITIVE_INFINITY;
          if (sortA !== sortB) return sortA - sortB;
          
          // 4) Binding time ASC
          const aBinding = Number.isFinite(a.bindingTime) ? a.bindingTime : 0;
          const bBinding = Number.isFinite(b.bindingTime) ? b.bindingTime : 0;
          if (aBinding !== bBinding) return aBinding - bBinding;

          // 5) Price ASC
          const aPrice = Number.isFinite(a.pricePerKwh) ? a.pricePerKwh : Number.POSITIVE_INFINITY;
          const bPrice = Number.isFinite(b.pricePerKwh) ? b.pricePerKwh : Number.POSITIVE_INFINITY;
          if (aPrice !== bPrice) return aPrice - bPrice;

          // 6) Stable fallback: supplier name
          return a.supplierName.localeCompare(b.supplierName);
        });
        
        // Debug: Log the data after sorting
        console.log('Plans after sorting:', sorted.map(p => ({
          supplier: p.supplierName,
          plan: p.planName,
          bindingTime: p.bindingTime,
          price: p.pricePerKwh,
          sortOrder: p.sortOrder
        })));
        
        setPlans(sorted);
        
        // Spåra sökningen för marknadsföring
        if (!hasTrackedSearch && sorted.length > 0) {
          const utm = getUtmParams();
          const payload = {
            postalCode: postalCode.trim() || null,
            priceZone: z,
            zoneSource: inferred && !zone ? 'postal_code' : zone ? 'manual' : 'inferred',
            pagePath: '/starta-har',
            sessionId,
            utmSource: utm.utmSource,
            utmMedium: utm.utmMedium,
            utmCampaign: utm.utmCampaign,
            plansShown: sorted.length,
            clickedPlan: false,
            clickedSupplier: null,
          };
          
          // Använd sendBeacon för bättre tillförlitlighet
          if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon('/api/events/postal-code-search', blob);
          } else {
            fetch('/api/events/postal-code-search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).catch(() => {});
          }
          setHasTrackedSearch(true);
        }
      })
      .then(() => setLoading(false), (e: unknown) => {
        setError(String(e));
        setLoading(false);
      });
  }, [effectiveZone, postalCode, zone, inferred, hasTrackedSearch, sessionId]);

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

          {effectiveZone && (
            <div style={{ marginTop: '8px', padding: '8px', background: '#f9fafb', border: '1px dashed #e5e7eb', borderRadius: 8, color: '#374151' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Debug – topp 6 etter sortering</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px' }}>
                {JSON.stringify(plans.slice(0, 6).map(p => ({ bindingTime: p.bindingTime, price: p.pricePerKwh, supplier: p.supplierName, plan: p.planName })), null, 2)}
              </pre>
            </div>
          )}

          <Plans>
            {loading && <div>Laster…</div>}
            {error && <div style={{ color: '#b91c1c' }}>Feil: {error}</div>}
            {effectiveZone && filteredPlans.map(plan => (
              <PlanCard key={plan.id}>
                <Logo className="logo" src={plan.logoUrl || getSupplierLogoUrl(plan.supplierName)} alt={`${plan.supplierName} logo`} />
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
                  {(plan.recommended || plan.priceBadge) && (
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
                      {plan.priceBadge && (
                        <span style={{ fontWeight: 800, color: '#111827' }}>{plan.priceBadge}</span>
                      )}
                    </div>
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
                      // Spåra klick på avtal
                      const utm = getUtmParams();
                      const payload = {
                        postalCode: postalCode.trim() || null,
                        priceZone: effectiveZone,
                        zoneSource: inferred && !zone ? 'postal_code' : zone ? 'manual' : 'inferred',
                        pagePath: '/starta-har',
                        sessionId,
                        utmSource: utm.utmSource,
                        utmMedium: utm.utmMedium,
                        utmCampaign: utm.utmCampaign,
                        plansShown: plans.length,
                        clickedPlan: true,
                        clickedSupplier: plan.supplierName,
                      };
                      
                      if (navigator.sendBeacon) {
                        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                        navigator.sendBeacon('/api/events/postal-code-search', blob);
                      } else {
                        fetch('/api/events/postal-code-search', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        }).catch(() => {});
                      }
                      
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


