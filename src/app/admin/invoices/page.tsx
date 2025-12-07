"use client";
import { useEffect, useState } from 'react';

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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invoices', { cache: 'no-store' });
      if (!res.ok) {
        setLogs([]);
      } else {
        const json = await res.json();
        setLogs((json?.items || []) as InvoiceLog[]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
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
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24, background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: '#1e293b', marginBottom: 8, fontSize: '28px', fontWeight: 'bold' }}>Fakturaanalyser (Admin)</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          placeholder="Sök (session, agent eller text)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', borderRadius: 6, fontSize: '14px' }}
        />
        <button onClick={fetchLogs} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Uppdatera</button>
      </div>
      {loading && <p style={{ color: '#64748b' }}>Laddar...</p>}
      {!loading && filtered.length === 0 && <p style={{ color: '#64748b' }}>Inga loggar.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px', minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Datum</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Session</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Fil</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Agent</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'center', color: 'white', fontWeight: '600' }}>Korrekt?</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Anteckning</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Åtgärder</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Bild</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, index) => (
                <>
                  <tr key={log.id} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', color: '#1e293b' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px', color: '#1e293b', fontSize: '13px', maxWidth: 200, wordBreak: 'break-all', fontFamily: 'monospace' }} title={log.session_id || ''}>{log.session_id}</td>
                    <td style={{ padding: '12px', color: '#1e293b', fontSize: '13px', maxWidth: 150 }} title={`${log.file_mime} ${typeof log.file_size === 'number' ? `• ${(log.file_size/1024).toFixed(0)} KB` : ''}`}>
                      {log.file_mime} {typeof log.file_size === 'number' ? `• ${(log.file_size/1024).toFixed(0)} KB` : ''}
                    </td>
                    <td style={{ padding: '12px', color: '#1e293b', fontSize: '13px', maxWidth: 300, wordBreak: 'break-all' }} title={log.user_agent || ''}>{log.user_agent}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#1e293b', fontSize: '18px' }}>
                      {log.is_correct === true && '✅'}
                      {log.is_correct === false && '❌'}
                      {log.is_correct === null && '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#1e293b', maxWidth: 300, wordBreak: 'break-word' }} title={log.correction_notes || ''}>
                      {log.correction_notes || ''}
                    </td>
                    <td style={{ padding: '12px', color: '#1e293b' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => setCorrect(log.id, true)} style={{ padding: '6px 12px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Markera ✅</button>
                        <button onClick={() => setCorrect(log.id, false)} style={{ padding: '6px 12px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Markera ❌</button>
                        <button onClick={() => editNotes(log.id)} style={{ padding: '6px 12px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Anteckning</button>
                        <button onClick={() => setExpanded(expanded === log.id ? null : log.id)} style={{ padding: '6px 12px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>{expanded === log.id ? 'Dölj' : 'Visa'}</button>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#1e293b' }}>
                      {log.consent ? (
                        <button
                          onClick={async () => {
                          try {
                            const res = await fetch(`/api/invoice-ocr/file-url?invoiceId=${log.id}`);
                            const data = await res.json();
                            if (data?.url) {
                              // Robust URL-hantering
                              const origin = window.location.protocol + '//' + window.location.host;
                              const imageUrl = data.url.startsWith('http') ? data.url : origin + data.url;
                              
                              // Validera URL
                              try {
                                new URL(imageUrl);
                                
                                // Försök öppna i nytt fönster
                                const newWindow = window.open(imageUrl, '_blank');
                                
                                if (!newWindow) {
                                  // Fallback: Skapa overlay med bild
                                  const overlay = document.createElement('div');
                                  overlay.style.cssText = `
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    height: 100%;
                                    background: rgba(0,0,0,0.8);
                                    z-index: 10000;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                  `;
                                  
                                  const img = document.createElement('img');
                                  img.src = imageUrl;
                                  img.style.cssText = `
                                    max-width: 90%;
                                    max-height: 90%;
                                    object-fit: contain;
                                    border-radius: 8px;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                                  `;
                                  
                                  const closeBtn = document.createElement('button');
                                  closeBtn.innerHTML = '×';
                                  closeBtn.style.cssText = `
                                    position: absolute;
                                    top: 20px;
                                    right: 20px;
                                    background: rgba(0,0,0,0.7);
                                    color: white;
                                    border: none;
                                    border-radius: 50%;
                                    width: 40px;
                                    height: 40px;
                                    font-size: 24px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                  `;
                                  
                                  overlay.appendChild(img);
                                  overlay.appendChild(closeBtn);
                                  document.body.appendChild(overlay);
                                  
                                  const closeOverlay = () => {
                                    document.body.removeChild(overlay);
                                  };
                                  
                                  overlay.onclick = closeOverlay;
                                  closeBtn.onclick = closeOverlay;
                                  
                                  // Stäng med Escape-tangent
                                  const handleEscape = (e: KeyboardEvent) => {
                                    if (e.key === 'Escape') {
                                      closeOverlay();
                                      document.removeEventListener('keydown', handleEscape);
                                    }
                                  };
                                  document.addEventListener('keydown', handleEscape);
                                }
                              } catch {
                                alert('Ogiltig URL: ' + imageUrl);
                              }
                            } else {
                              // Visa detaljerat felmeddelande från API
                              const errorMsg = data?.error || 'Ingen bild hittades eller kunde inte skapa länk.';
                              const details = data?.details ? `\n\nDetaljer: ${data.details}` : '';
                              alert(errorMsg + details);
                            }
                          } catch (err) {
                            alert('Kunde inte hämta bildlänk: ' + (err instanceof Error ? err.message : 'Okänt fel'));
                          }
                        }}
                          style={{ padding: '6px 12px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                          title="Öppna förhandsvisning i nytt fönster"
                        >
                          Visa bild
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Inget samtycke</span>
                      )}
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan={8} style={{ padding: '16px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: 8, fontFamily: 'monospace' }}>SHA256: {log.image_sha256}</div>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#1e293b', fontSize: '14px' }}>{log.gpt_answer}</div>
                      </td>
                    </tr>
                  )}
              </>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


