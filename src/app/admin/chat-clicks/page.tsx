"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = "grodan2025";

type ChatClick = {
  id: number;
  created_at: string;
  session_id: string | null;
  user_agent: string | null;
  referer: string | null;
  href: string | null;
  button_type: string | null;
  source: string | null;
};

export default function AdminChatClicks() {
  const [logs, setLogs] = useState<ChatClick[]>([]);
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
      .from('chat_clicks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLogs(data as ChatClick[]);
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

  const withinDate = (dateStr: string) => {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(dateStr);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  };

  const filtered = logs.filter(l =>
    withinDate(l.created_at) &&
    (!search || 
      (l.session_id && l.session_id.toLowerCase().includes(search.toLowerCase())) ||
      (l.user_agent && l.user_agent.toLowerCase().includes(search.toLowerCase())) ||
      (l.href && l.href.toLowerCase().includes(search.toLowerCase())) ||
      (l.button_type && l.button_type.toLowerCase().includes(search.toLowerCase()))
    )
  );

  // Statistik
  const totalClicks = filtered.length;
  const baerumClicks = filtered.filter(l => l.button_type === 'baerum_energi').length;
  const uniqueSessions = new Set(filtered.map(l => l.session_id).filter(Boolean)).size;

  // Gruppera per dag
  const byDay = filtered.reduce<Record<string, number>>((acc, l) => {
    const d = new Date(l.created_at).toISOString().split('T')[0];
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const dailyStats = Object.entries(byDay)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7);

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
      <h1>Chat-klick (Admin)</h1>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 12 }}>
        Spårning av klick från GrokChat-komponenten (Elge)
      </p>
      
      {/* Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{totalClicks}</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>Totalt klick</div>
        </div>
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{baerumClicks}</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>Bærum Energi</div>
        </div>
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{uniqueSessions}</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>Unika sessioner</div>
        </div>
      </div>

      {/* Daglig statistik */}
      {dailyStats.length > 0 && (
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Senaste 7 dagarna</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dailyStats.map(([date, count]) => (
              <div key={date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>{new Date(date).toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{count} klick</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#64748b' }}>Från</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
          <label style={{ fontSize: 12, color: '#64748b' }}>Till</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        </div>
        <input
          placeholder="Sök (session, agent, href, button_type)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
        />
        <button onClick={fetchLogs} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Uppdatera</button>
      </div>
      {loading && <p>Laddar...</p>}
      {!loading && filtered.length === 0 && <p>Inga klickloggar.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Datum</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Knapptyp</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Länk</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Session ID</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>User Agent</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Referer</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>
                    {new Date(l.created_at).toLocaleString('sv-SE', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td style={{ padding: 12, fontSize: 14 }}>
                    <span style={{ 
                      background: l.button_type === 'baerum_energi' ? '#dbeafe' : '#f3f4f6', 
                      color: l.button_type === 'baerum_energi' ? '#1e40af' : '#374151',
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}>
                      {l.button_type || '—'}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 14 }}>
                    {l.href ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', maxWidth: 300, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.href}
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#64748b' }}>
                    {l.session_id ? l.session_id.substring(0, 16) + '...' : '—'}
                  </td>
                  <td style={{ padding: 12, fontSize: 12, color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.user_agent || '—'}
                  </td>
                  <td style={{ padding: 12, fontSize: 12, color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.referer || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

