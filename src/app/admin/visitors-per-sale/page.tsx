'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  adminFetch,
  clearAdminBrowserSession,
  isAdminBrowserSessionReady,
  storeAdminPassword,
} from '@/lib/adminClient';
import { defaultVisitorsPerSaleRange } from '@/lib/stockholmDates';

const ADMIN_PASSWORD = 'grodan2025';

type DailyRow = {
  date: string;
  edgeUniques: number;
  pageViews: number;
  startHerSessions: number;
  planClicks: number;
  supplierClicks: Record<string, number>;
  salesBySupplier: Record<string, number>;
  totalSales: number;
};

type ApiResponse = {
  from: string;
  to: string;
  timezone: string;
  mock?: boolean;
  kpis: {
    visitorsPerSale: number | null;
    startHerSessionsPerSale: number | null;
    supplier: {
      supplier: string;
      label: string;
      clicksPerSale: number | null;
      clicks: number;
      sales: number;
    }[];
  };
  totals: {
    visitors: number;
    sessions: number;
    planClicks: number;
    sales: number;
  };
  daily: DailyRow[];
  visitorsMeta: {
    label: string;
    utcDays: boolean;
    includesBots: boolean;
    note?: string;
  };
  salesCaveat: string;
  warnings: string[];
};

function formatRatio(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '–';
  return value.toLocaleString('nb-NO', { maximumFractionDigits: 1 });
}

function MiniChart({ daily }: { daily: DailyRow[] }) {
  const max = Math.max(...daily.map((d) => d.edgeUniques), 1);
  const barW = Math.max(4, Math.min(14, Math.floor(600 / Math.max(daily.length, 1))));
  return (
    <div style={{ overflowX: 'auto', padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, minHeight: 140 }}>
        {daily.map((d) => {
          const hVisitors = Math.round((d.edgeUniques / max) * 120);
          const hSales = Math.round(((d.totalSales * max * 0.08) / max) * 120);
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d.edgeUniques} besøk, ${d.totalSales} salg`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: barW }}
            >
              <div
                style={{
                  width: '100%',
                  height: hVisitors,
                  background: '#3b82f6',
                  borderRadius: '2px 2px 0 0',
                }}
              />
              {d.totalSales > 0 && (
                <div
                  style={{
                    width: '70%',
                    height: Math.max(4, hSales),
                    background: '#16a34a',
                    marginTop: 2,
                    borderRadius: 2,
                  }}
                />
              )}
              <span style={{ fontSize: 9, color: '#64748b', transform: 'rotate(-45deg)', marginTop: 8 }}>
                {d.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0' }}>
        Blått = edge unike besøkere per dag · grønt = salg (alle leverandører)
      </p>
    </div>
  );
}

export default function VisitorsPerSaleAdmin() {
  const defaults = useMemo(() => defaultVisitorsPerSaleRange(), []);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthed(isAdminBrowserSessionReady());
    }
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({ from, to });
      if (useMock) qs.set('mock', '1');
      const res = await adminFetch(`/api/admin/visitors-per-sale?${qs}`, { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        clearAdminBrowserSession();
        setAuthed(false);
        setData(null);
        setLoginError(
          'Sesjonen mangler admin-passord for API. Logg inn på nytt (samme passord som /admin).'
        );
        return;
      }
      if (!res.ok) {
        throw new Error(json.error || res.statusText);
      }
      setData(json as ApiResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunne ikke hente data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      storeAdminPassword(input);
      setLoginError('');
    } else {
      setLoginError('Feil passord');
    }
  }

  if (!authed) {
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h2>Admininnlogging</h2>
        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
          Samme innlogging som på{' '}
          <Link href="/admin" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            /admin
          </Link>
          .
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Passord"
            style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
            autoFocus
          />
          <button type="submit" style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600 }}>
            Logg inn
          </button>
        </form>
        {loginError && <div style={{ color: 'red', marginTop: 8 }}>{loginError}</div>}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28, color: '#1e293b' }}>Besøkende per salg</h1>
        <Link
          href="/admin"
          style={{
            color: 'var(--primary)',
            fontWeight: 600,
            padding: '8px 14px',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          ← Tilbake til Admin
        </Link>
      </div>

      <p style={{ color: '#64748b', marginTop: 0, lineHeight: 1.5 }}>
        Budsjetter annonser ved å sammenligne Cloudflare edge-besøk, /start-her-trakt og SaleSys Bruttosalg.
      </p>

      <ul style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
        <li>
          <strong>{data?.visitorsMeta.label ?? 'Edge unique visitors'}:</strong> Cloudflare httpRequests1dGroups (UTC-dager, inkl. noe bottrafikk).
        </li>
        <li>
          <strong>Start-her:</strong> Sesjoner og klikk fra <code>postal_code_searches</code> på /start-her og /starta-har.
        </li>
      </ul>

      <VisitorsPerSaleFilters
        from={from}
        to={to}
        useMock={useMock}
        loading={loading}
        onFrom={setFrom}
        onTo={setTo}
        onMock={setUseMock}
        onApply={load}
      />

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {data.mock && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              Viser mockdata (ingen eksterne API-kall).
            </div>
          )}

          <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>{data.salesCaveat}</p>

          {data.warnings?.length > 0 && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <strong>Merknader:</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                {data.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <VisitorsPerSaleKpis data={data} />

          <section style={{ marginTop: 24, border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Daglig oversikt</h2>
            <MiniChart daily={data.daily} />
          </section>

          <section style={{ marginTop: 24, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1e293b', color: 'white' }}>
                  <th style={{ padding: 10, textAlign: 'left' }}>Dato ({data.timezone})</th>
                  <th style={{ padding: 10, textAlign: 'right' }}>Edge unike</th>
                  <th style={{ padding: 10, textAlign: 'right' }}>Sidevisninger</th>
                  <th style={{ padding: 10, textAlign: 'right' }}>Start-her sesjoner</th>
                  <th style={{ padding: 10, textAlign: 'right' }}>Planklikk</th>
                  <th style={{ padding: 10, textAlign: 'right' }}>Salg</th>
                </tr>
              </thead>
              <tbody>
                {data.daily.map((row, i) => (
                  <tr key={row.date} style={{ background: i % 2 ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: 10 }}>{row.date}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>{row.edgeUniques}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>{row.pageViews}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>{row.startHerSessions}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>{row.planClicks}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>{row.totalSales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function VisitorsPerSaleFilters(props: {
  from: string;
  to: string;
  useMock: boolean;
  loading: boolean;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onMock: (v: boolean) => void;
  onApply: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end', marginBottom: 20 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Fra
        <input type="date" value={props.from} onChange={(e) => props.onFrom(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Til
        <input type="date" value={props.to} onChange={(e) => props.onTo(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 8 }}>
        <input type="checkbox" checked={props.useMock} onChange={(e) => props.onMock(e.target.checked)} />
        Mockdata
      </label>
      <button
        type="button"
        onClick={props.onApply}
        disabled={props.loading}
        style={{ padding: '10px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: props.loading ? 'wait' : 'pointer' }}
      >
        {props.loading ? 'Laster…' : 'Oppdater'}
      </button>
    </div>
  );
}

function VisitorsPerSaleKpis({ data }: { data: ApiResponse }) {
  const k = data.kpis;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <KpiCard title="Besøkere per salg" value={formatRatio(k.visitorsPerSale)} sub={`${data.totals.visitors} besøk / ${data.totals.sales} salg`} />
      <KpiCard title="Start-her sesjoner per salg" value={formatRatio(k.startHerSessionsPerSale)} sub={`${data.totals.sessions} sesjoner`} />
      {k.supplier.map((s) => (
        <KpiCard
          key={s.supplier}
          title={`${s.label}: klikk per salg`}
          value={formatRatio(s.clicksPerSale)}
          sub={`${s.clicks} klikk / ${s.sales} salg`}
        />
      ))}
    </div>
  );
}

function KpiCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div>
    </div>
  );
}