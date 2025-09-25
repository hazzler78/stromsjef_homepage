"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = "grodan2025";

type InvoiceLog = {
  id: number;
  created_at: string;
  session_id: string | null;
  user_agent: string | null;
  file_mime: string | null;
  file_size: number | null;
  image_sha256: string | null;
  model: string | null;
  system_prompt_version: string | null;
  gpt_answer: string | null;
  is_correct: boolean | null;
  correction_notes: string | null;
  corrected_total_extra: number | null;
  corrected_savings: number | null;
  consent?: boolean | null;
};

export default function AdminInvoices() {
  const [logs, setLogs] = useState<InvoiceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  // no-op state removed to satisfy eslint
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  // Create Supabase client lazily at runtime to avoid build-time URL parsing
  const getSupabase = () =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

  const fetchLogs = async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('invoice_ocr')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLogs(data as InvoiceLog[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchLogs();
  }, [authed]);

  async function setCorrect(id: number, isCorrect: boolean) {
    try {
      const res = await fetch('/api/invoice-ocr/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: id, isCorrect })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || 'Kunde inte spara status');
      } else {
        await fetchLogs();
      }
    } catch {
      setError('Kunde inte spara status');
    }
  }

  async function editNotes(id: number) {
    const current = logs.find(l => l.id === id)?.correction_notes || '';
    const input = window.prompt('Korrigeringsanteckning:', current || '');
    if (input === null) return;
    try {
      const res = await fetch('/api/invoice-ocr/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: id, correctionNotes: input })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || 'Kunde inte spara anteckning');
      } else {
        await fetchLogs();
      }
    } catch {
      setError('Kunde inte spara anteckning');
    }
  }

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

  const filtered = logs.filter(l =>
    !search ||
    (l.session_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.user_agent || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.gpt_answer || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
      <h1>Fakturaanalyser (Admin)</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          placeholder="Sök (session, agent eller text)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
        />
        <button onClick={fetchLogs} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Uppdatera</button>
      </div>
      {loading && <p>Laddar...</p>}
      {!loading && filtered.length === 0 && <p>Inga loggar.</p>}

      {!loading && filtered.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Datum</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Session</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Fil</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Agent</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Korrekt?</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Anteckning</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Åtgärder</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Bild</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <>
                <tr key={log.id}>
                  <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12, maxWidth: 200, wordBreak: 'break-all' }} title={log.session_id || ''}>{log.session_id}</td>
                  <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12, maxWidth: 150 }} title={`${log.file_mime} ${typeof log.file_size === 'number' ? `• ${(log.file_size/1024).toFixed(0)} KB` : ''}`}>
                    {log.file_mime} {typeof log.file_size === 'number' ? `• ${(log.file_size/1024).toFixed(0)} KB` : ''}
                  </td>
                  <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12, maxWidth: 300, wordBreak: 'break-all' }} title={log.user_agent || ''}>{log.user_agent}</td>
                  <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                    {log.is_correct === true && '✅'}
                    {log.is_correct === false && '❌'}
                    {log.is_correct === null && '—'}
                  </td>
                  <td style={{ padding: 8, border: '1px solid #e5e7eb', maxWidth: 300, wordBreak: 'break-word' }} title={log.correction_notes || ''}>
                    {log.correction_notes || ''}
                  </td>
                  <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => setCorrect(log.id, true)} style={{ padding: '4px 8px' }}>Markera ✅</button>
                      <button onClick={() => setCorrect(log.id, false)} style={{ padding: '4px 8px' }}>Markera ❌</button>
                      <button onClick={() => editNotes(log.id)} style={{ padding: '4px 8px' }}>Anteckning</button>
                      <button onClick={() => setExpanded(expanded === log.id ? null : log.id)} style={{ padding: '4px 8px' }}>{expanded === log.id ? 'Dölj' : 'Visa'}</button>
                    </div>
                  </td>
                  <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                    {log.consent ? (
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/invoice-ocr/file-url?invoiceId=${log.id}`);
                            const data = await res.json();
                            if (data?.url) {
                              window.open(data.url, '_blank');
                            } else {
                              alert('Ingen bild hittades eller kunde inte skapa länk.');
                            }
                          } catch {
                            alert('Kunde inte hämta bildlänk.');
                          }
                        }}
                        style={{ padding: '4px 8px' }}
                        title="Öppna förhandsvisning i nytt fönster"
                      >
                        Visa bild
                      </button>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: 12 }}>Inget samtycke</span>
                    )}
                  </td>
                </tr>
                {expanded === log.id && (
                  <tr>
                    <td colSpan={7} style={{ background: '#f9fafb', padding: 16, border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>SHA256: {log.image_sha256}</div>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{log.gpt_answer}</div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


