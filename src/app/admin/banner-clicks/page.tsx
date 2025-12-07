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
  }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24, background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: '#1e293b', marginBottom: 8 }}>Bannerklick (Admin)</h1>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 12, fontSize: '16px' }}>
        CTR = klick / visningar per variant (senaste hämtningen)
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 14, color: '#64748b', fontWeight: '500' }}>Från</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '14px', color: '#1e293b' }} />
          <label style={{ fontSize: 14, color: '#64748b', fontWeight: '500' }}>Till</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '14px', color: '#1e293b' }} />
        </div>
        <input
          placeholder="Sök (session, agent, href, variant)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '14px', color: '#1e293b' }}
        />
        <button onClick={fetchLogs} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Uppdatera</button>
      </div>
      {loading && <p style={{ color: '#64748b' }}>Laddar...</p>}
      {!loading && filtered.length === 0 && <p style={{ color: '#64748b' }}>Inga klickloggar.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Datum</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Variant</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Session</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Href</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Referer</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Agent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, index) => (
                <tr key={l.id} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>{new Date(l.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '600' }}>{l.variant}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '13px', color: '#1e293b' }}>{l.session_id}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '13px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b' }} title={l.href || ''}>{l.href}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '13px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b' }} title={l.referer || ''}>{l.referer}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '13px', color: '#1e293b' }}>{l.user_agent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Översikt och CTR per variant (filtrerat intervall) */}
      {!loading && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>CTR per variant</h2>
          {/* Snabböversikt */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
            {['A','B'].map(v => {
              const vClicks = filtered.filter(l => l.variant === v).length;
              const vImps = filteredImpressions.filter(i => i.variant === v).length;
              const ctrNum = vImps > 0 ? (vClicks / vImps) : 0;
              return (
                <div key={v} style={{ border: '2px solid #e2e8f0', borderRadius: 8, padding: 16, background: '#f8fafc', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 4 }}>Variant {v}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{vImps > 0 ? (ctrNum * 100).toFixed(1) + '%' : '—'}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{vClicks} klick • {vImps} visningar</div>
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
                <div style={{ border: '2px solid #e2e8f0', borderRadius: 8, padding: 16, background: '#f8fafc', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 4 }}>Relativ skillnad</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{(aImps > 0 || bImps > 0) ? label : '—'}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>B jämfört med A</div>
                </div>
              );
            })()}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Variant</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Visningar</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Klick</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>CTR</th>
              </tr>
            </thead>
            <tbody>
              {['A','B'].map((v, index) => {
                const vClicks = filtered.filter(l => l.variant === v).length;
                const vImps = filteredImpressions.filter(i => i.variant === v).length;
                const ctr = vImps > 0 ? `${((vClicks / vImps) * 100).toFixed(1)}%` : '—';
                return (
                  <tr key={v} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>
                      <div style={{ fontWeight: '600', marginBottom: 4 }}>{v}</div>
                      <div style={{ fontSize: '0.85em', color: '#64748b' }}>{variantNames[v as keyof typeof variantNames]}</div>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{vImps}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{vClicks}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{ctr}</td>
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
          <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Nedbrytning per källa (referer-domän)</h2>
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
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Domän</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Visningar</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Klick</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((r, index) => (
                    <tr key={r.domain} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>{r.domain}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{r.impressions}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{r.clicks}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{r.impressions > 0 ? ((r.ctr * 100).toFixed(1) + '%') : '—'}</td>
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
          <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Nedbrytning per destination (href)</h2>
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
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#1e293b' }}>
                      <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Href</th>
                      <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Klick</th>
                      <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>CTR (global)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, index) => (
                      <tr key={r.href} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '12px', border: '1px solid #e5e7eb', maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b' }} title={r.href}>{r.href}</td>
                        <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{r.clicks}</td>
                        <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{(r.ctr * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}


