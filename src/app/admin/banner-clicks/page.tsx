"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = "grodan2025";

type BannerClick = {
  id: number;
  created_at: string;
  session_id: string | null;
  user_agent: string | null;
  referer: string | null;
  href: string | null;
  variant: string | null;
};

type BannerImpression = {
  id: number;
  created_at: string;
  session_id: string | null;
  user_agent: string | null;
  referer: string | null;
  variant: string | null;
};

export default function AdminBannerClicks() {
  const [logs, setLogs] = useState<BannerClick[]>([]);
  const [impressions, setImpressions] = useState<BannerImpression[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  const getSupabase = () =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

  const fetchLogs = async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('banner_clicks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLogs(data as BannerClick[]);
    const imp = await supabase
      .from('banner_impressions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!imp.error && imp.data) setImpressions(imp.data as BannerImpression[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchLogs();
  }, [authed]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      setError('');
    } else {
      setError('Fel lösenord!');
    }
  }

  if (!authed) {
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h2>Admininloggning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Lösenord"
            style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
            autoFocus
          />
        <button type="submit" style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600 }}>
            Logga in
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  const withinDate = (iso: string) => {
    if (!dateFrom && !dateTo) return true;
    const ts = new Date(iso).getTime();
    if (dateFrom) {
      const start = new Date(dateFrom + 'T00:00:00').getTime();
      if (ts < start) return false;
    }
    if (dateTo) {
      const end = new Date(dateTo + 'T23:59:59').getTime();
      if (ts > end) return false;
    }
    return true;
  };

  const filtered = logs
    .filter(l => withinDate(l.created_at))
    .filter(l =>
      !search ||
      (l.session_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.user_agent || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.href || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.variant || '').toLowerCase().includes(search.toLowerCase())
    );

  const filteredImpressions = impressions.filter(i => withinDate(i.created_at));

  // Variant descriptions for AI calculator banner
  const variantNames = {
    'A': 'Nyhet! Låt vår AI analysera din elräkning och räkna ut din möjliga besparing.',
    'B': 'Testa vår AI – ladda upp din faktura och se hur mycket du kan spara.'
  };

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
      <h1>Bannerklick (Admin)</h1>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 12 }}>
        CTR = klick / visningar per variant (senaste hämtningen)
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#64748b' }}>Från</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
          <label style={{ fontSize: 12, color: '#64748b' }}>Till</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        </div>
        <input
          placeholder="Sök (session, agent, href, variant)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
        />
        <button onClick={fetchLogs} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Uppdatera</button>
      </div>
      {loading && <p>Laddar...</p>}
      {!loading && filtered.length === 0 && <p>Inga klickloggar.</p>}

      {!loading && filtered.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Datum</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Variant</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Session</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Href</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Referer</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Agent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{new Date(l.created_at).toLocaleString()}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{l.variant}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12 }}>{l.session_id}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.href || ''}>{l.href}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.referer || ''}>{l.referer}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12 }}>{l.user_agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Översikt och CTR per variant (filtrerat intervall) */}
      {!loading && (
        <div style={{ marginTop: 24 }}>
          <h2>CTR per variant</h2>
          {/* Snabböversikt */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
            {['A','B'].map(v => {
              const vClicks = filtered.filter(l => l.variant === v).length;
              const vImps = filteredImpressions.filter(i => i.variant === v).length;
              const ctrNum = vImps > 0 ? (vClicks / vImps) : 0;
              return (
                <div key={v} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Variant {v}</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{vImps > 0 ? (ctrNum * 100).toFixed(1) + '%' : '—'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{vClicks} klick • {vImps} visningar</div>
                </div>
              );
            })}
            {/* Lift */}
            {(() => {
              const aClicks = filtered.filter(l => l.variant === 'A').length;
              const aImps = filteredImpressions.filter(i => i.variant === 'A').length;
              const bClicks = filtered.filter(l => l.variant === 'B').length;
              const bImps = filteredImpressions.filter(i => i.variant === 'B').length;
              const aCtr = aImps > 0 ? aClicks / aImps : 0;
              const bCtr = bImps > 0 ? bClicks / bImps : 0;
              const lift = aCtr && bCtr ? ((bCtr - aCtr) / aCtr) * 100 : 0;
              const label = lift === 0 ? '—' : `${lift > 0 ? '+' : ''}${lift.toFixed(1)}% B vs A`;
              return (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Relativ skillnad</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{(aImps > 0 || bImps > 0) ? label : '—'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>B jämfört med A</div>
                </div>
              );
            })()}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Variant</th>
                <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Visningar</th>
                <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Klick</th>
                <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>CTR</th>
              </tr>
            </thead>
            <tbody>
              {['A','B'].map(v => {
                const vClicks = filtered.filter(l => l.variant === v).length;
                const vImps = filteredImpressions.filter(i => i.variant === v).length;
                const ctr = vImps > 0 ? `${((vClicks / vImps) * 100).toFixed(1)}%` : '—';
                return (
                  <tr key={v}>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                      <div><strong>{v}</strong></div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>{variantNames[v as keyof typeof variantNames]}</div>
                    </td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{vImps}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{vClicks}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{ctr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Nedbrytning: Referer-domän */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Nedbrytning per källa (referer-domän)</h2>
          {(() => {
            const domainOf = (url?: string | null) => {
              if (!url) return '(okänd)';
              try {
                const u = new URL(url);
                return u.hostname.replace(/^www\./, '');
              } catch {
                return '(okänd)';
              }
            };
            const rows = filtered.reduce<Record<string, { clicks: number; a: number; b: number }>>((acc, l) => {
              const d = domainOf(l.referer);
              if (!acc[d]) acc[d] = { clicks: 0, a: 0, b: 0 };
              acc[d].clicks += 1;
              if (l.variant === 'A') acc[d].a += 1;
              if (l.variant === 'B') acc[d].b += 1;
              return acc;
            }, {});
            const impRows = filteredImpressions.reduce<Record<string, { imps: number; a: number; b: number }>>((acc, i) => {
              const d = domainOf(i.referer);
              if (!acc[d]) acc[d] = { imps: 0, a: 0, b: 0 };
              acc[d].imps += 1;
              if (i.variant === 'A') acc[d].a += 1;
              if (i.variant === 'B') acc[d].b += 1;
              return acc;
            }, {});
            const entries = Object.entries(rows).map(([domain, c]) => {
              const imp: { imps: number; a: number; b: number } = impRows[domain] || { imps: 0, a: 0, b: 0 };
              const ctr = imp.imps > 0 ? (c.clicks / imp.imps) : 0;
              return { domain, clicks: c.clicks, impressions: imp.imps, ctr };
            }).sort((a, b) => b.clicks - a.clicks).slice(0, 12);
            return (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Domän</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Visningar</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Klick</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(r => (
                    <tr key={r.domain}>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.domain}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.impressions}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.clicks}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.impressions > 0 ? ((r.ctr * 100).toFixed(1) + '%') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      )}

      {/* Nedbrytning: Destination (href) */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Nedbrytning per destination (href)</h2>
          {(() => {
            const byHref = filtered.reduce<Record<string, { clicks: number }>>((acc, l) => {
              const key = l.href || '(okänd)';
              if (!acc[key]) acc[key] = { clicks: 0 };
              acc[key].clicks += 1;
              return acc;
            }, {});
            const impByHref = filteredImpressions.reduce<Record<string, number>>((acc) => {
              const key = '(banner)';
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {});
            const rows = Object.entries(byHref).map(([href, v]) => ({
              href,
              clicks: v.clicks,
              impressions: impByHref['(banner)'] || 0,
              ctr: (impByHref['(banner)'] || 0) > 0 ? v.clicks / (impByHref['(banner)'] || 1) : 0
            })).sort((a, b) => b.clicks - a.clicks).slice(0, 12);
            return (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Href</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Klick</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>CTR (global)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.href}>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.href}>{r.href}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.clicks}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{(r.ctr * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      )}
    </div>
  );
}


