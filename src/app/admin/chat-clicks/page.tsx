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
  const [showTable, setShowTable] = useState(false);

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

  // Om inget datumfilter, skapa lista med senaste 30 dagarna från idag
  let daysToShow: [string, number][];
  
  if (dateFrom || dateTo) {
    // Om filter finns, visa alla dagar i filtrerat intervall
    const allDays = Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]));
    daysToShow = allDays;
  } else {
    // Skapa lista med senaste 30 dagarna från idag bakåt
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: [string, number][] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push([dateStr, byDay[dateStr] || 0]);
    }
    
    daysToShow = days;
  }
  
  const maxClicks = Math.max(...daysToShow.map(([, count]) => count), 1);

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24, background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: '#1e293b', marginBottom: 8 }}>Chat-klick (Admin)</h1>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 12, fontSize: '16px' }}>
        Spårning av klick från GrokChat-komponenten (Elge)
      </p>
      
      {/* Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Totalt klick</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0066a7' }}>{totalClicks}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Bærum Energi</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a' }}>{baerumClicks}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Unika sessioner</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{uniqueSessions}</div>
        </div>
      </div>

      {/* Graf för daglig statistik */}
      {daysToShow.length > 0 && (
        <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '2px solid #e2e8f0', marginBottom: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
            Klick per dag {dateFrom || dateTo ? '(filtrerat)' : '(senaste 30 dagarna)'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '300px', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
            {daysToShow.map(([date, count], index) => {
              const heightPercent = (count / maxClicks) * 100;
              const dateObj = new Date(date);
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
              const isFirstOrLast = index === 0 || index === daysToShow.length - 1;
              const isFirstOfMonth = dateObj.getDate() === 1;
              
              return (
                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <div 
                    style={{ 
                      width: '100%',
                      background: isWeekend 
                        ? 'linear-gradient(to top, #8b5cf6, #a78bfa)' 
                        : 'linear-gradient(to top, #0066a7, #0284c7)',
                      height: `${heightPercent}%`,
                      minHeight: count > 0 ? '4px' : '0',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                      boxShadow: count > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                    title={`${dateObj.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}: ${count} klick`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scaleY(1.05)';
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scaleY(1)';
                      e.currentTarget.style.opacity = '1';
                    }}
                  />
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#64748b', 
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>
                    {daysToShow.length <= 14 
                      ? dateObj.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
                      : (
                        <>
                          <div>{dateObj.getDate()}</div>
                          {(isFirstOrLast || isFirstOfMonth) && (
                            <div style={{ fontSize: '9px', opacity: 0.7 }}>
                              {dateObj.toLocaleDateString('sv-SE', { month: 'short' })}
                            </div>
                          )}
                        </>
                      )
                    }
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#64748b' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Totalt: {daysToShow.reduce((sum, [, count]) => sum + count, 0)} klick</span>
              {' '} över {daysToShow.length} dagar
            </div>
            <div>
              Max: <span style={{ fontWeight: '600', color: '#0066a7' }}>{maxClicks}</span> klick/dag
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 14, color: '#64748b', fontWeight: '500' }}>Från</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '14px', color: '#1e293b' }} />
          <label style={{ fontSize: 14, color: '#64748b', fontWeight: '500' }}>Till</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '14px', color: '#1e293b' }} />
        </div>
        <input
          placeholder="Sök (session, agent, href, button_type)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '14px', color: '#1e293b' }}
        />
        <button onClick={fetchLogs} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Uppdatera</button>
      </div>
      {loading && <p style={{ color: '#64748b' }}>Laddar...</p>}
      {!loading && filtered.length === 0 && <p style={{ color: '#64748b' }}>Inga klickloggar.</p>}

      {/* Toggle för att visa/dölja tabellen */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button 
            onClick={() => setShowTable(!showTable)}
            style={{ 
              padding: '10px 20px', 
              borderRadius: 8, 
              border: '1px solid #cbd5e1', 
              background: showTable ? '#0066a7' : 'white', 
              color: showTable ? 'white' : '#1e293b', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {showTable ? '▼ Dölj detaljerad lista' : '▶ Visa detaljerad lista'}
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && showTable && (
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Datum</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Knapptyp</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Länk</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Session ID</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>User Agent</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Referer</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, index) => (
                <tr key={l.id} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', color: '#1e293b' }}>
                    {new Date(l.created_at).toLocaleString('sv-SE', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>
                    <span style={{ 
                      background: l.button_type === 'baerum_energi' ? '#dbeafe' : '#f3f4f6', 
                      color: l.button_type === 'baerum_energi' ? '#1e40af' : '#374151',
                      padding: '4px 12px', 
                      borderRadius: 6, 
                      fontSize: '13px', 
                      fontWeight: '600' 
                    }}>
                      {l.button_type || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>
                    {l.href ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ color: '#0066a7', textDecoration: 'underline', maxWidth: 300, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.href}
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'monospace', color: '#1e293b' }}>
                    {l.session_id ? l.session_id.substring(0, 16) + '...' : '—'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.user_agent || '—'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

