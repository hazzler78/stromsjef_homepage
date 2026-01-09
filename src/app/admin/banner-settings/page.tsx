"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = "grodan2025";

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

interface BannerSettings {
  id: number;
  active: boolean;
  variant_a_expanded_text: string;
  variant_b_expanded_text: string;
  variant_a_collapsed_text: string;
  variant_b_collapsed_text: string;
  highlight_text: string;
  link_url: string;
  link_text_expanded: string;
  link_text_collapsed: string;
  updated_at?: string;
}

export default function AdminBannerSettings() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<BannerSettings | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchSettings();
  }, [authed]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('banner_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        // Om ingen inställning finns, skapa en default i databasen
        if (error.code === 'PGRST116') {
          const defaultSettings: BannerSettings = {
            id: 1,
            active: true,
            variant_a_expanded_text: 'Vår beste deal akkurat nå: Fastpris 99 øre/kWh – anbefales sterkt!',
            variant_b_expanded_text: 'Vår beste deal akkurat nå: Fastpris 99 øre/kWh – anbefales sterkt!',
            variant_a_collapsed_text: 'Fastpris 99 øre/kWh – anbefales sterkt!',
            variant_b_collapsed_text: 'Fastpris 99 øre/kWh – anbefales sterkt!',
            highlight_text: 'Fastpris 99 øre/kWh',
            link_url: 'https://baerumenergi.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
            link_text_expanded: 'Se avtale →',
            link_text_collapsed: 'Se avtale',
          };
          
          // Försök skapa default-inställningen i databasen
          const { error: insertError } = await supabase
            .from('banner_settings')
            .insert({
              id: 1,
              ...defaultSettings,
            });
          
          if (insertError) {
            console.warn('Kunde inte skapa default-inställning automatiskt:', insertError);
            setSettings(defaultSettings);
            setError('Kunde inte skapa default-inställning automatiskt. Vänligen spara inställningarna manuellt genom att klicka på "Spara inställningar".');
          } else {
            const { data: insertedData } = await supabase
              .from('banner_settings')
              .select('*')
              .eq('id', 1)
              .single();
            
            if (insertedData) {
              setSettings(insertedData as BannerSettings);
            } else {
              setSettings(defaultSettings);
            }
          }
        } else {
          setError('Kunde inte hämta inställningar: ' + error.message);
        }
      } else if (data) {
        setSettings(data as BannerSettings);
      }
    } catch (err) {
      setError('Ett fel uppstod: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const supabase = getSupabase();
      const settingsWithoutId = {
        active: settings.active,
        variant_a_expanded_text: settings.variant_a_expanded_text,
        variant_b_expanded_text: settings.variant_b_expanded_text,
        variant_a_collapsed_text: settings.variant_a_collapsed_text,
        variant_b_collapsed_text: settings.variant_b_collapsed_text,
        highlight_text: settings.highlight_text,
        link_url: settings.link_url,
        link_text_expanded: settings.link_text_expanded,
        link_text_collapsed: settings.link_text_collapsed,
      };
      const { error } = await supabase
        .from('banner_settings')
        .upsert({
          id: 1,
          ...settingsWithoutId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        setError('Kunde inte spara inställningar: ' + error.message);
      } else {
        setSuccess('Inställningar sparade! Banner kommer att uppdateras på sidan.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Ett fel uppstod: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && !settings) {
    return (
      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
        <p>Laddar...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
        <p>Inga inställningar hittades.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24, background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: '#1e293b', marginBottom: 8 }}>Banner Inställningar</h1>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, fontSize: '16px' }}>
        Hantera banner-texten högst upp på sidan. Banner visas i två varianter (A och B) för A/B-testning.
      </p>

      {error && (
        <div style={{ 
          padding: 12, 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: 8, 
          color: '#dc2626', 
          marginBottom: 16 
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: 12, 
          background: '#dcfce7', 
          border: '1px solid #bbf7d0', 
          borderRadius: 8, 
          color: '#166534', 
          marginBottom: 16 
        }}>
          {success}
        </div>
      )}

      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: 12, 
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.active}
              onChange={(e) => setSettings({ ...settings, active: e.target.checked })}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
              Aktivera banner
            </span>
          </label>
          <p style={{ fontSize: 14, color: '#64748b', marginLeft: 32 }}>
            När deaktiverad visas ingen banner högst upp på sidan
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Highlight-text (markerad text)
          </label>
          <input
            type="text"
            value={settings.highlight_text}
            onChange={(e) => setSettings({ ...settings, highlight_text: e.target.value })}
            placeholder="T.ex: Fastpris 99 øre/kWh"
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #cbd5e1', 
              borderRadius: 6, 
              fontSize: '14px',
              color: '#1e293b'
            }}
          />
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Denna text kommer att markeras med röd bakgrund i bannern
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Länk-URL
          </label>
          <input
            type="url"
            value={settings.link_url}
            onChange={(e) => setSettings({ ...settings, link_url: e.target.value })}
            placeholder="https://example.com/..."
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #cbd5e1', 
              borderRadius: 6, 
              fontSize: '14px',
              color: '#1e293b'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Länk-text (expanderad)
          </label>
          <input
            type="text"
            value={settings.link_text_expanded}
            onChange={(e) => setSettings({ ...settings, link_text_expanded: e.target.value })}
            placeholder="T.ex: Se avtale →"
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #cbd5e1', 
              borderRadius: 6, 
              fontSize: '14px',
              color: '#1e293b'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Länk-text (kollapsad)
          </label>
          <input
            type="text"
            value={settings.link_text_collapsed}
            onChange={(e) => setSettings({ ...settings, link_text_collapsed: e.target.value })}
            placeholder="T.ex: Se avtale"
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #cbd5e1', 
              borderRadius: 6, 
              fontSize: '14px',
              color: '#1e293b'
            }}
          />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginTop: 32, marginBottom: 16 }}>
          Variant A
        </h3>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Expanderad text (Variant A)
          </label>
          <textarea
            value={settings.variant_a_expanded_text}
            onChange={(e) => setSettings({ ...settings, variant_a_expanded_text: e.target.value })}
            placeholder="Text som visas när bannern är expanderad"
            rows={3}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #cbd5e1', 
              borderRadius: 6, 
              fontSize: '14px',
              color: '#1e293b',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Använd {`{highlight}`} för att infoga highlight-texten. T.ex: &quot;Vår beste deal: {`{highlight}`} – anbefales!&quot;
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Kollapsad text (Variant A)
          </label>
          <textarea
            value={settings.variant_a_collapsed_text}
            onChange={(e) => setSettings({ ...settings, variant_a_collapsed_text: e.target.value })}
            placeholder="Text som visas när bannern är kollapsad"
            rows={2}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #cbd5e1', 
              borderRadius: 6, 
              fontSize: '14px',
              color: '#1e293b',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Använd {`{highlight}`} för att infoga highlight-texten
          </p>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginTop: 32, marginBottom: 16 }}>
          Variant B
        </h3>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Expanderad text (Variant B)
          </label>
          <textarea
            value={settings.variant_b_expanded_text}
            onChange={(e) => setSettings({ ...settings, variant_b_expanded_text: e.target.value })}
            placeholder="Text som visas när bannern är expanderad"
            rows={3}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #cbd5e1', 
              borderRadius: 6, 
              fontSize: '14px',
              color: '#1e293b',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Använd {`{highlight}`} för att infoga highlight-texten. T.ex: &quot;Vår beste deal: {`{highlight}`} – anbefales!&quot;
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Kollapsad text (Variant B)
          </label>
          <textarea
            value={settings.variant_b_collapsed_text}
            onChange={(e) => setSettings({ ...settings, variant_b_collapsed_text: e.target.value })}
            placeholder="Text som visas när bannern är kollapsad"
            rows={2}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #cbd5e1', 
              borderRadius: 6, 
              fontSize: '14px',
              color: '#1e293b',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Använd {`{highlight}`} för att infoga highlight-texten
          </p>
        </div>

        <button
          onClick={saveSettings}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#94a3b8' : 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Sparar...' : 'Spara inställningar'}
        </button>
      </div>

      {/* Förhandsvisning */}
      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: 12, 
        padding: 24
      }}>
        <h2 style={{ color: '#1e293b', marginBottom: 16, fontSize: '20px' }}>Förhandsvisning</h2>
        
        {(() => {
          const renderPreviewText = (text: string) => {
            const parts = text.split('{highlight}');
            return (
              <>
                {parts.map((part, index) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < parts.length - 1 && (
                      <span style={{ 
                        color: '#BA0C2F', 
                        background: 'rgba(186, 12, 47, 0.2)', 
                        padding: '0.1em 0.4em', 
                        borderRadius: '0.4em', 
                        border: '1px solid rgba(186, 12, 47, 0.3)' 
                      }}>
                        {settings.highlight_text}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </>
            );
          };

          return (
            <>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>Variant A - Expanderad</h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textAlign: 'center',
                  padding: '1.2rem 0.5rem',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  marginBottom: 8
                }}>
                  {renderPreviewText(settings.variant_a_expanded_text)}
                  <br />
                  <a href={settings.link_url} style={{ color: '#BA0C2F', textDecoration: 'underline', fontWeight: 700 }}>
                    {settings.link_text_expanded}
                  </a>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>Variant A - Kollapsad</h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textAlign: 'center',
                  padding: '0.8rem 0.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {renderPreviewText(settings.variant_a_collapsed_text)}
                  <a href={settings.link_url} style={{ color: '#BA0C2F', textDecoration: 'underline', fontWeight: 700 }}>
                    {settings.link_text_collapsed}
                  </a>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>Variant B - Expanderad</h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textAlign: 'center',
                  padding: '1.2rem 0.5rem',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  marginBottom: 8
                }}>
                  {renderPreviewText(settings.variant_b_expanded_text)}
                  <br />
                  <a href={settings.link_url} style={{ color: '#BA0C2F', textDecoration: 'underline', fontWeight: 700 }}>
                    {settings.link_text_expanded}
                  </a>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>Variant B - Kollapsad</h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textAlign: 'center',
                  padding: '0.8rem 0.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {renderPreviewText(settings.variant_b_collapsed_text)}
                  <a href={settings.link_url} style={{ color: '#BA0C2F', textDecoration: 'underline', fontWeight: 700 }}>
                    {settings.link_text_collapsed}
                  </a>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
