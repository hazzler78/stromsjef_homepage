"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';
import SalesysForm, { type SalesysLoadState } from '@/components/SalesysForm';
import { ElectricityPlan, PriceZone, inferZoneFromPostalCode, getSupplierLogoUrl } from '@/lib/electricity';
import { createClient } from '@supabase/supabase-js';
import {
  SALESYS_FORM_IDS,
  SALESYS_PRODUCT_IDS,
  canTrackAnalytics,
  canTrackMarketing,
  captureUtmFromUrl,
  contractTypeFromPlan,
  generateEventId,
  getStoredUtm,
  isKildenSupplier,
  observeSalesysSuccess,
  trackFunnelEvent,
} from '@/lib/funnelTracking';
import { normalizeSupabaseProjectUrl } from '@/lib/supabaseUrl';
import { resolvePlanAffiliateLink } from '@/lib/planAffiliateLink';

/**
 * Inline Salesys accordion under Kilden Kraft plans on /start-her.
 * Non-Kilden suppliers keep resolvePlanAffiliateLink() CTAs.
 * If the embed fails again, set to `false` to fall back to affiliate for everyone.
 */
const ENABLE_INLINE_SALESYS_FORM = true;

const Section = styled.section`
  padding: var(--section-spacing) 0;
  overflow-x: clip;
`;

/** Same as global .container, but zero horizontal pad on mobile so the form can go edge-to-edge. */
const PageShell = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--container-padding);

  @media (max-width: 639px) {
    padding: 0;
  }
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

  @media (max-width: 639px) {
    padding: 1rem 0 1.25rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--primary);

  @media (max-width: 639px) {
    padding: 0 1rem;
  }
`;

const Lead = styled.p`
  color: var(--gray-700);
  margin-bottom: 1.5rem;

  @media (max-width: 639px) {
    padding: 0 1rem;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: end;

  @media (max-width: 639px) {
    padding: 0 1rem;
  }

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

  @media (max-width: 639px) {
    /* 8px inset so the 1px card border is visible on both sides; same width collapsed/expanded. */
    padding: 0 8px;
    gap: 0.5rem;
  }
`;

const PlanRow = styled.div<{ $expanded?: boolean }>`
  border: 1px solid ${(p) => (p.$expanded ? '#93c5fd' : '#e5e7eb')};
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
`;

const PlanCard = styled.div`
  display: grid;
  grid-template-areas: "logo details cta";
  grid-template-columns: 64px 1fr auto;
  gap: 1rem;
  align-items: center;
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

const InlineFormPanel = styled.div`
  padding: 0.9rem 1rem 1.1rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;

  @media (max-width: 639px) {
    /* Heading/copy keep 16px; form bleeds via SalesysFormBleed below. */
    padding: 0.9rem 0 0;
  }
`;

const FormIntro = styled.div`
  @media (max-width: 639px) {
    padding: 0 1rem;
  }
`;

/** Desktop: edge-to-edge inside plan card. Mobile: full viewport width. */
const SalesysFormBleed = styled.div`
  margin: 0 -1rem;
  width: calc(100% + 2rem);
  max-width: none;

  @media (max-width: 639px) {
    margin: 0;
    width: 100%;
  }

  #start-her-salesys-form,
  #start-her-salesys-form iframe {
    display: block;
    width: 100% !important;
    max-width: 100%;
  }
`;

const StatusNote = styled.div`
  @media (max-width: 639px) {
    padding: 0 1rem;
  }
`;

const SALESYS_CONTAINER_ID = 'start-her-salesys-form';

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
  price_zone: string;
  logo_url?: string | null;
  affiliate_link?: string | null;
  featured?: boolean;
  recommended?: boolean | null;
  sort_order?: number | null;
  price_badge?: string | null;
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

function utmForApi() {
  const utm = getStoredUtm();
  return {
    utmSource: utm.utm_source ?? null,
    utmMedium: utm.utm_medium ?? null,
    utmCampaign: utm.utm_campaign ?? null,
    utmContent: utm.utm_content ?? null,
  };
}

export default function StartHer() {
  const [postalCode, setPostalCode] = useState('');
  const [zone, setZone] = useState<PriceZone | ''>('');
  const [plans, setPlans] = useState<ElectricityPlanWithBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [hasTrackedSearch, setHasTrackedSearch] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ElectricityPlanWithBadge | null>(null);
  const [formMountKey, setFormMountKey] = useState(0);
  const [salesysLoadState, setSalesysLoadState] = useState<SalesysLoadState>('loading');
  const [affiliateFallbackDue, setAffiliateFallbackDue] = useState(false);
  const salesysUsableRef = useRef(false);
  const purchaseTrackedRef = useRef(false);
  const viewContentTrackedRef = useRef(false);

  const trackFunnelEntry = useCallback(() => {
    if (viewContentTrackedRef.current) return;
    if (!canTrackMarketing() && !canTrackAnalytics()) return;
    viewContentTrackedRef.current = true;
    const eventId = generateEventId();
    const utm = getStoredUtm();
    trackFunnelEvent({
      eventId,
      utm,
      metaEvent: 'ViewContent',
      metaParams: { content_name: 'start-her', content_category: 'funnel' },
      ga4Event: 'view_start',
      ga4Params: { page_path: '/start-her' },
    });
  }, []);

  useEffect(() => {
    captureUtmFromUrl();
    trackFunnelEntry();
    window.addEventListener('cookieConsentChanged', trackFunnelEntry);
    return () => window.removeEventListener('cookieConsentChanged', trackFunnelEntry);
  }, [trackFunnelEntry]);

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
    const supabaseUrl = normalizeSupabaseProjectUrl(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
    );
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
        const parseNumber = (value: unknown, fallback: number): number => {
          if (typeof value === 'number' && Number.isFinite(value)) return value;
          if (typeof value === 'string') {
            const n = Number(value.replace(',', '.'));
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
          bindingTime: parseNumber(r.binding_time, 0),
          bindingTimeText: r.binding_time_text || undefined,
          termsGuarantee: r.terms_guarantee || undefined,
          guaranteeDisclaimer: r.guarantee_disclaimer || undefined,
          terminationFee: r.termination_fee != null ? Number(r.termination_fee) : undefined,
          priceZone: r.price_zone as PriceZone,
          logoUrl: r.logo_url || getSupplierLogoUrl(r.supplier_name),
          affiliateLink: r.affiliate_link || undefined,
          featured: !!r.featured,
          recommended: !!r.recommended,
          sortOrder: r.sort_order != null ? Number(r.sort_order) : undefined,
          priceBadge: r.price_badge || undefined,
        }));
        // Sort by recommended/featured first, then sort_order, then binding time, price, and supplier name
        setPlans(mapped.sort((a, b) => {
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
          
          // 4) Binding time
          const bindDiff = (Number.isFinite(a.bindingTime) ? a.bindingTime : 0) - (Number.isFinite(b.bindingTime) ? b.bindingTime : 0);
          if (bindDiff !== 0) return bindDiff;
          
          // 5) Price per kWh
          const priceA = Number.isFinite(a.pricePerKwh) ? a.pricePerKwh : Number.POSITIVE_INFINITY;
          const priceB = Number.isFinite(b.pricePerKwh) ? b.pricePerKwh : Number.POSITIVE_INFINITY;
          if (priceA !== priceB) return priceA - priceB;
          
          // 6) Supplier name as stable fallback
          return a.supplierName.localeCompare(b.supplierName);
        }));
        
        // Spåra sökningen för marknadsföring
        if (!hasTrackedSearch && mapped.length > 0) {
          const utm = utmForApi();
          const payload = {
            postalCode: postalCode.trim() || null,
            priceZone: z,
            zoneSource: inferred && !zone ? 'postal_code' : zone ? 'manual' : 'inferred',
            pagePath: '/start-her',
            sessionId,
            ...utm,
            plansShown: mapped.length,
            clickedPlan: false,
            clickedSupplier: null,
          };

          if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon('/api/events/postal-code-search', blob);
          } else {
            fetch('/api/events/postal-code-search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
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

  const fireSearchTracking = useCallback(
    (zoneLabel: string) => {
      const eventId = generateEventId();
      const utm = getStoredUtm();
      trackFunnelEvent({
        eventId,
        utm,
        metaEvent: 'Search',
        metaParams: {
          search_string: postalCode.trim() || zoneLabel,
          content_category: zoneLabel,
        },
        ga4Event: 'search_postnummer',
        ga4Params: {
          postnummer: postalCode.trim() || null,
          prisomrade: zoneLabel,
        },
      });
    },
    [postalCode]
  );

  const handleFind = () => {
    setTouched(true);
    if (!effectiveZone) return;
    fireSearchTracking(effectiveZone);
  };

  const trackPurchase = useCallback(
    (plan: ElectricityPlanWithBadge) => {
      if (purchaseTrackedRef.current) return;
      purchaseTrackedRef.current = true;
      const eventId = generateEventId();
      const utm = getStoredUtm();
      const value = Number.isFinite(plan.monthlyFee) ? Math.max(plan.monthlyFee * 12, 0) : 0;
      trackFunnelEvent({
        eventId,
        utm,
        metaEvent: 'Purchase',
        metaParams: {
          value,
          currency: 'NOK',
          content_name: `${plan.supplierName} · ${plan.planName}`,
        },
        ga4Event: 'purchase',
        ga4Params: {
          value,
          currency: 'NOK',
          item_name: `${plan.supplierName} · ${plan.planName}`,
        },
      });
    },
    []
  );

  const handleSelectPlan = (plan: ElectricityPlanWithBadge) => {
    const useInlineSalesys =
      ENABLE_INLINE_SALESYS_FORM && isKildenSupplier(plan.supplierName);

    // Toggle collapse when tapping the already-expanded Kilden card (restores chat FAB).
    if (useInlineSalesys && selectedPlan?.id === plan.id) {
      setSelectedPlan(null);
      setAffiliateFallbackDue(false);
      return;
    }

    const utm = utmForApi();
    const contractType = contractTypeFromPlan(plan.bindingTime);
    const contentName = `${plan.supplierName} · ${plan.planName}`;

    const postalPayload = {
      postalCode: postalCode.trim() || null,
      priceZone: effectiveZone,
      zoneSource: inferred && !zone ? 'postal_code' : zone ? 'manual' : 'inferred',
      pagePath: '/start-her',
      sessionId,
      ...utm,
      plansShown: plans.length,
      clickedPlan: true,
      clickedSupplier: plan.supplierName,
    };
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/events/postal-code-search',
        new Blob([JSON.stringify(postalPayload)], { type: 'application/json' })
      );
    }

    const contractPayload = JSON.stringify({
      contractType,
      sessionId,
      source: 'start-her',
      supplierName: plan.supplierName,
      planId: plan.id,
      savingsAmount: null,
      ...utm,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/events/contract-click', new Blob([contractPayload], { type: 'application/json' }));
    } else {
      fetch('/api/events/contract-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: contractPayload,
      }).catch(() => {});
    }

    const leadEventId = generateEventId();
    trackFunnelEvent({
      eventId: leadEventId,
      metaEvent: 'Lead',
      metaParams: { content_name: contentName, content_category: contractType },
      ga4Event: 'select_contract',
      ga4Params: {
        supplier: plan.supplierName,
        plan_name: plan.planName,
        contract_type: contractType,
      },
    });

    if (!useInlineSalesys) {
      // Affiliate path (all non-Kilden, or when inline Salesys is disabled).
      trackFunnelEvent({
        eventId: generateEventId(),
        metaEvent: 'InitiateCheckout',
        metaParams: { content_name: contentName, content_category: contractType },
        ga4Event: 'begin_checkout',
        ga4Params: {
          supplier: plan.supplierName,
          plan_name: plan.planName,
        },
      });
      const affiliateUrl = resolvePlanAffiliateLink(plan);
      if (affiliateUrl) {
        window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    // Kilden Kraft: inline Salesys under #bytteskjema
    purchaseTrackedRef.current = false;
    setSalesysLoadState('loading');
    salesysUsableRef.current = false;
    setAffiliateFallbackDue(false);
    setSelectedPlan(plan);
    setFormMountKey((k) => k + 1);
  };

  const handleSalesysUsable = useCallback(() => {
    salesysUsableRef.current = true;
    setAffiliateFallbackDue(false);
  }, []);

  useEffect(() => {
    if (!selectedPlan) {
      setAffiliateFallbackDue(false);
      return;
    }
    salesysUsableRef.current = false;
    setAffiliateFallbackDue(false);
    const deadlineTimer = window.setTimeout(() => {
      if (!salesysUsableRef.current) {
        setAffiliateFallbackDue(true);
      }
    }, 5000);
    return () => {
      window.clearTimeout(deadlineTimer);
    };
  }, [selectedPlan?.id, formMountKey]);

  const onSalesysReady = useCallback(() => {
    // Only when ENABLE_INLINE_SALESYS_FORM is true.
    if (!selectedPlan) return;
    window.setTimeout(() => {
      if (!selectedPlan) return;
      const eventId = generateEventId();
      const contentName = `${selectedPlan.supplierName} · ${selectedPlan.planName}`;
      trackFunnelEvent({
        eventId,
        metaEvent: 'InitiateCheckout',
        metaParams: { content_name: contentName, content_category: contractTypeFromPlan(selectedPlan.bindingTime) },
        ga4Event: 'begin_checkout',
        ga4Params: {
          supplier: selectedPlan.supplierName,
          plan_name: selectedPlan.planName,
        },
      });
    }, 0);
  }, [selectedPlan]);

  // Matches Kilden Kraft working embed from Salesys (Bjørnar).
  const salesysOptions = useMemo(
    () =>
      ({
        query: { isAlertHandled: true },
        width: '100%',
        themeHostname: 'webform.kildenkraft.no',
        theme: {},
        loadBackground: '#FFFFFF00',
      }) as const,
    []
  );

  const salesysDefaultFields = useMemo(() => {
    const pc = postalCode.trim();
    if (pc.length < 4) return [];
    return [{ fieldId: '66e9457420ef2d3b8c66f500', value: pc }];
  }, [postalCode]);

  useEffect(() => {
    if (!ENABLE_INLINE_SALESYS_FORM || !selectedPlan) return undefined;
    return observeSalesysSuccess(SALESYS_CONTAINER_ID, () => trackPurchase(selectedPlan));
  }, [selectedPlan, formMountKey, trackPurchase]);

  // Signal GrokChat FAB to hide while the inline Salesys panel is open (mobile polish).
  useEffect(() => {
    const open =
      !!selectedPlan &&
      ENABLE_INLINE_SALESYS_FORM &&
      isKildenSupplier(selectedPlan.supplierName);
    document.body.dataset.inlineSalesysOpen = open ? '1' : '0';
    return () => {
      delete document.body.dataset.inlineSalesysOpen;
    };
  }, [selectedPlan]);

  // After expand: scroll "Bytt til …" just below the sticky campaign banner.
  useEffect(() => {
    if (!selectedPlan || !ENABLE_INLINE_SALESYS_FORM) return;
    if (!isKildenSupplier(selectedPlan.supplierName)) return;

    const scrollFormBelowBanner = () => {
      const target = document.getElementById('bytteskjema');
      if (!target) return;

      const banner = document.querySelector('[data-campaign-banner="true"]') as HTMLElement | null;
      const bannerH = banner?.getBoundingClientRect().height ?? 0;
      const gap = 8;
      const rect = target.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 640;

      if (isDesktop) {
        // Skip if the form top is already comfortably in view under the banner.
        if (rect.top >= bannerH + gap && rect.top < window.innerHeight * 0.55) return;
      }

      const absoluteTop = rect.top + window.scrollY;
      const targetY = Math.max(0, absoluteTop - bannerH - gap);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: targetY, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    // Wait for accordion DOM to paint.
    const t = window.setTimeout(scrollFormBelowBanner, 80);
    return () => window.clearTimeout(t);
  }, [selectedPlan?.id, formMountKey]);

  return (
    <Section>
      <PageShell>
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
            <StatusNote>
              <p style={{ color: '#b91c1c', marginTop: '0.75rem' }}>
                Klarte ikke å fastslå strømområde. Velg område i listen for å fortsette.
              </p>
            </StatusNote>
          )}

          {effectiveZone && (
            <StatusNote>
              <div style={{ marginTop: '1rem', color: 'var(--gray-700)' }}>
                Viser avtaler for <strong>{effectiveZone}</strong>{inferred && !zone ? ' (fra postnummer)' : ''} (inkl. Alle soner).
              </div>
            </StatusNote>
          )}

          <Plans>
            {loading && <div>Laster…</div>}
            {error && <div style={{ color: '#b91c1c' }}>Feil: {error}</div>}
            {effectiveZone && filteredPlans.map((plan) => {
              const isExpanded = selectedPlan?.id === plan.id;
              const affiliateUrl = resolvePlanAffiliateLink(plan);
              const showAffiliate =
                isExpanded &&
                !!affiliateUrl &&
                (affiliateFallbackDue || salesysLoadState === 'failed');

              return (
                <PlanRow key={plan.id} $expanded={isExpanded}>
                  <PlanCard>
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
                        Avtalen forutsetter godkjent kredittvurdering. Avtaler kan sammenlignes med andre avtaler på{' '}
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
                        onClick={() => handleSelectPlan(plan)}
                        aria-label={`Velg ${plan.supplierName} ${plan.planName}`}
                        aria-expanded={isExpanded}
                      >
                        Velg avtalen
                      </GlassButton>
                    </div>
                  </PlanCard>
                  {ENABLE_INLINE_SALESYS_FORM &&
                    isKildenSupplier(plan.supplierName) &&
                    isExpanded && (
                    <InlineFormPanel id="bytteskjema">
                      <FormIntro>
                        <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>
                          Bytt til {plan.supplierName} – {plan.planName}
                        </h2>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem' }}>
                          Fyll ut skjemaet for å fullføre byttet. Postnummer: {postalCode.trim() || '—'} · Sone: {effectiveZone}
                        </p>
                        {!postalCode.trim() && (
                          <p style={{ color: '#92400e', fontSize: '0.9rem', marginTop: 0 }}>
                            Tips: Skriv inn postnummer over for forhåndsutfylling, eller bruk leverandørens lenke under.
                          </p>
                        )}
                      </FormIntro>
                      <SalesysFormBleed>
                        <SalesysForm
                          key={formMountKey}
                          containerId={SALESYS_CONTAINER_ID}
                          formId={SALESYS_FORM_IDS.kilden}
                          productId={SALESYS_PRODUCT_IDS.kilden}
                          options={salesysOptions}
                          defaultFields={salesysDefaultFields}
                          onReady={onSalesysReady}
                          onLoadStateChange={setSalesysLoadState}
                          onFormUsable={handleSalesysUsable}
                        />
                      </SalesysFormBleed>
                      {salesysLoadState === 'loading' && !affiliateFallbackDue && (
                        <FormIntro>
                          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginTop: '0.75rem' }}>
                            Laster bytteskjema…
                          </p>
                        </FormIntro>
                      )}
                      {showAffiliate && (
                        <FormIntro>
                          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                            <GlassButton
                              variant="primary"
                              size="md"
                              background="linear-gradient(135deg, var(--primary), var(--secondary))"
                              disableScrollEffect={true}
                              disableHoverEffect={true}
                              onClick={() => window.open(affiliateUrl!, '_blank', 'noopener,noreferrer')}
                              aria-label={`Fortsett hos ${plan.supplierName}`}
                            >
                              Fortsett bestilling hos {plan.supplierName}
                            </GlassButton>
                          </div>
                        </FormIntro>
                      )}
                    </InlineFormPanel>
                  )}
                </PlanRow>
              );
            })}
            {effectiveZone && !loading && filteredPlans.length === 0 && (
              <div style={{ color: 'var(--gray-700)', marginTop: 8 }}>Ingen avtale for valgt område akkurat nå.</div>
            )}
          </Plans>
        </Container>
      </PageShell>
    </Section>
  );
}