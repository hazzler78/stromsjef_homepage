"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = "grodan2025";

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

interface ChatPopupSettings {
  id: number;
  active: boolean;
  title: string;
  button_text: string;
  button_url: string;
  dismiss_text: string;
  delay_seconds: number;
  show_once_per_session: boolean;
  updated_at?: string;
}

export default function AdminChatPopup() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ChatPopupSettings | null>(null);

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
        .from('chat_popup_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        // Om ingen inställning finns, skapa en default
        if (error.code === 'PGRST116') {
          const defaultSettings: ChatPopupSettings = {
            id: 1,
            active: true,
            title: 'Hei! Vil du ha 99 øre fastpris i dag?',
            button_text: 'Trykk her →',
            button_url: 'https://baerumenergi.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
            dismiss_text: 'Nei takk',
            delay_seconds: 2,
            show_once_per_session: true,
          };
          setSettings(defaultSettings);
        } else {
          setError('Kunde inte hämta inställningar: ' + error.message);
        }
      } else if (data) {
        setSettings(data as ChatPopupSettings);
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
      // Ta bort id från settings för att undvika dubbel definition
      const { id, ...settingsWithoutId } = settings;
      const { error } = await supabase
        .from('chat_popup_settings')
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
        setSuccess('Inställningar sparade!');
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
      <h1 style={{ color: '#1e293b', marginBottom: 8 }}>Elge Chat Popup Inställningar</h1>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, fontSize: '16px' }}>
        Hantera popup-meddelandet som visas när chatten öppnas första gången
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
              Aktivera popup
            </span>
          </label>
          <p style={{ fontSize: 14, color: '#64748b', marginLeft: 32 }}>
            När aktiverad visas popupen när chatten öppnas första gången i sessionen
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Popup-rubrik
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            placeholder="T.ex: Hei! Vil du ha 99 øre fastpris i dag?"
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
            Knapptext
          </label>
          <input
            type="text"
            value={settings.button_text}
            onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
            placeholder="T.ex: Trykk her →"
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
            Knapp-URL
          </label>
          <input
            type="url"
            value={settings.button_url}
            onChange={(e) => setSettings({ ...settings, button_url: e.target.value })}
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
            Avvisa-knapptext
          </label>
          <input
            type="text"
            value={settings.dismiss_text}
            onChange={(e) => setSettings({ ...settings, dismiss_text: e.target.value })}
            placeholder="T.ex: Nei takk"
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
            Fördröjning (sekunder)
          </label>
          <input
            type="number"
            value={settings.delay_seconds}
            onChange={(e) => setSettings({ ...settings, delay_seconds: parseInt(e.target.value) || 0 })}
            min="0"
            max="10"
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
            Hur många sekunder efter att sidan laddas innan popupen visas
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.show_once_per_session}
              onChange={(e) => setSettings({ ...settings, show_once_per_session: e.target.checked })}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
              Visa endast en gång per session
            </span>
          </label>
          <p style={{ fontSize: 14, color: '#64748b', marginLeft: 32 }}>
            När aktiverad visas popupen bara första gången användaren öppnar chatten i denna session
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
        <div style={{
          background: '#e0f2fe',
          color: '#17416b',
          borderRadius: '16px 16px 16px 4px',
          padding: '12px 16px',
          maxWidth: '400px',
          fontSize: 16,
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,106,167,0.12)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
            Elge
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>{settings.title}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
            <a
              href={settings.button_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              {settings.button_text}
            </a>
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#17416b',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {settings.dismiss_text}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

