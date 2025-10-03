"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getForbrukerrådetPrices } from '@/lib/forbrukerradetService';

const ADMIN_PASSWORD = "grodan2025";

type ForbrukerrådetPrice = {
  id: number;
  year: number;
  week: number;
  consumption: number;
  name: string;
  no1: number;
  no2: number;
  no3: number;
  no4: number;
  no5: number;
  national: number;
  created_at: string;
  updated_at: string;
  source: string;
};

export default function AdminForbrukerrådetPrices() {
  const [prices, setPrices] = useState<ForbrukerrådetPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [filter, setFilter] = useState({
    year: 0,
    week: 0,
    consumption: 0,
    name: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchPrices();
    }
  }, [authed]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getForbrukerrådetPrices();
      setPrices(data);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      setAuthError('');
    } else {
      setAuthError('Fel lösenord!');
    }
  };

  const getUniqueValues = (field: keyof ForbrukerrådetPrice) => {
    const values = prices.map(price => price[field]);
    return Array.from(new Set(values)).sort();
  };

  const getConsumptionDisplayName = (consumption: number) => {
    const consumptionMap: { [key: number]: string } = {
      5000: '5 MWh',
      10000: '10 MWh', 
      16000: '16 MWh',
      20000: '20 MWh',
      40000: '40 MWh'
    };
    return consumptionMap[consumption] || `${consumption} MWh`;
  };

  const getPriceTypeDisplayName = (name: string) => {
    const typeMap: { [key: string]: string } = {
      'spot': 'Spotpris',
      'variable': 'Variabel pris',
      'fixed 1 year': 'Fast 1 år',
      'fixed 2 years': 'Fast 2 år',
      'fixed 3 years': 'Fast 3 år',
      'fixed 5 years': 'Fast 5 år',
      'purchase': 'Innkjøp',
      'plus': 'Plus',
      'other': 'Annet',
      'hourly_spot': 'Timepris'
    };
    return typeMap[name] || name;
  };

  const formatForbrukerrådetPrice = (price: number) => {
    return `${price.toFixed(4)} øre/kWh`;
  };

  const filteredPrices = prices.filter(price => {
    if (filter.year && price.year !== filter.year) return false;
    if (filter.week && price.week !== filter.week) return false;
    if (filter.consumption && price.consumption !== filter.consumption) return false;
    if (filter.name && price.name !== filter.name) return false;
    return true;
  });

  const triggerUpdate = async () => {
    try {
      const response = await fetch('/api/prices-forbruk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_UPDATE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Priser uppdaterade! Laddar om sidan...');
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Fel vid uppdatering: ${errorData.error}`);
      }
    } catch (err) {
      alert(`Fel vid uppdatering: ${err}`);
    }
  };

  if (!authed) {
    return (
      <div style={{ 
        maxWidth: 400, 
        margin: '4rem auto', 
        padding: 24, 
        border: '1px solid #e5e7eb', 
        borderRadius: 12,
        background: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Admininloggning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Lösenord"
            style={{ 
              width: '100%', 
              padding: 12, 
              fontSize: 16, 
              marginBottom: 12, 
              borderRadius: 8, 
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box'
            }}
            autoFocus
          />
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: 12, 
              fontSize: 16, 
              borderRadius: 8, 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Logga in
          </button>
        </form>
        {authError && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{authError}</div>}
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '2rem auto', 
      padding: 24,
      minHeight: '100vh',
      background: 'white'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 48,
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: 8,
          fontWeight: 700
        }}>
          📊 Forbrukerrådet Priser
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          opacity: 0.9,
          margin: 0
        }}>
          Visa och hantera priser från Forbrukerrådets strømprisportal
        </p>
        <div style={{ 
          marginTop: 16,
          fontSize: '0.9rem',
          opacity: 0.8
        }}>
          Senast uppdaterad: {prices.length > 0 ? new Date(prices[0].created_at).toLocaleString('sv-SE') : 'N/A'}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ marginBottom: 24 }}>
        <Link 
          href="/admin" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            textDecoration: 'none',
            color: '#374151',
            background: 'white',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          ← Tillbaka till Admin
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ 
          padding: 16, 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: 8,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: 12, color: '#dc2626' }}>⚠️</div>
            <div>
              <h3 style={{ margin: 0, color: '#991b1b', fontSize: '14px', fontWeight: 600 }}>Fel vid laddning</h3>
              <p style={{ margin: '4px 0 0 0', color: '#b91c1c', fontSize: '14px' }}>{error}</p>
              {error.includes('Missing Supabase configuration') && (
                <div style={{ 
                  marginTop: 12, 
                  padding: 12, 
                  background: '#fef3c7', 
                  border: '1px solid #fbbf24',
                  borderRadius: 6
                }}>
                  <p style={{ margin: 0, color: '#92400e', fontSize: '13px' }}>
                    <strong>Lösning:</strong> Kontrollera att följande miljövariabler är satta:<br/>
                    • NEXT_PUBLIC_SUPABASE_URL<br/>
                    • NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </p>
                </div>
              )}
              {error.includes('Ingen data hittades') && (
                <button 
                  onClick={triggerUpdate}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Hämta data från Forbrukerrådet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ 
            display: 'inline-block',
            width: 48,
            height: 48,
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ marginTop: 16, fontSize: '18px', fontWeight: 500, color: '#374151' }}>Laddar priser...</div>
          <div style={{ marginTop: 8, fontSize: '14px', color: '#6b7280' }}>Hämtar data från Forbrukerrådet</div>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && (
        <div style={{ 
          padding: 24, 
          background: '#f9fafb', 
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          marginBottom: 24
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px', fontWeight: 600 }}>🔍 Filter & Sök</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: 4 }}>År</label>
              <select
                value={filter.year}
                onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 6,
                  fontSize: '14px'
                }}
              >
                <option value={0}>Alle år</option>
                {getUniqueValues('year').map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Uke</label>
              <select
                value={filter.week}
                onChange={(e) => setFilter({ ...filter, week: parseInt(e.target.value) })}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 6,
                  fontSize: '14px'
                }}
              >
                <option value={0}>Alle uker</option>
                {getUniqueValues('week').map(week => (
                  <option key={week} value={week}>Uke {week}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Forbruk</label>
              <select
                value={filter.consumption}
                onChange={(e) => setFilter({ ...filter, consumption: parseInt(e.target.value) })}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 6,
                  fontSize: '14px'
                }}
              >
                <option value={0}>Alle nivåer</option>
                {getUniqueValues('consumption').map(consumption => (
                  <option key={consumption} value={consumption}>
                    {getConsumptionDisplayName(Number(consumption))}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Pristype</label>
              <select
                value={filter.name}
                onChange={(e) => setFilter({ ...filter, name: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 6,
                  fontSize: '14px'
                }}
              >
                <option value="">Alle typer</option>
                {getUniqueValues('name').map(name => (
                  <option key={name} value={name}>
                    {getPriceTypeDisplayName(String(name))}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!loading && !error && (
        <div style={{ 
          padding: 16, 
          background: '#eff6ff', 
          border: '1px solid #bfdbfe',
          borderRadius: 8,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e40af' }}>
                📊 Visar {filteredPrices.length} av {prices.length} priser
              </div>
              {filteredPrices.length !== prices.length && (
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  (filtrerat från {prices.length} totalt)
                </div>
              )}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Senast uppdaterad: {prices.length > 0 ? new Date(prices[0].created_at).toLocaleString('sv-SE') : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>📅 År/Uke</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>⚡ Forbruk</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>🏷️ Pristype</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>📍 NO1</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>📍 NO2</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>📍 NO3</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>📍 NO4</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>📍 NO5</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>🇳🇴 Nasjonalt</th>
                <th style={{ padding: 12, border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>🕒 Oppdatert</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.map((price, index) => (
                <tr key={price.id} style={{ background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                        {price.year}
                      </div>
                      <div style={{ marginLeft: 8, fontSize: '14px', color: '#6b7280' }}>
                        Uke {price.week}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: '12px',
                      fontWeight: 500,
                      background: '#fef3c7',
                      color: '#92400e'
                    }}>
                      {getConsumptionDisplayName(Number(price.consumption))}
                    </span>
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: '12px',
                      fontWeight: 500,
                      background: '#dbeafe',
                      color: '#1e40af'
                    }}>
                      {getPriceTypeDisplayName(String(price.name))}
                    </span>
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb', fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>
                    {formatForbrukerrådetPrice(price.no1)}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb', fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>
                    {formatForbrukerrådetPrice(price.no2)}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb', fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>
                    {formatForbrukerrådetPrice(price.no3)}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb', fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>
                    {formatForbrukerrådetPrice(price.no4)}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb', fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>
                    {formatForbrukerrådetPrice(price.no5)}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600, color: '#1f2937' }}>
                    {formatForbrukerrådetPrice(price.national)}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #e5e7eb', fontSize: '14px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div>{new Date(price.created_at).toLocaleDateString('sv-SE')}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(price.created_at).toLocaleTimeString('sv-SE')}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredPrices.length === 0 && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: 16 }}>📊</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', margin: '0 0 8px 0' }}>Ingen data hittades</h3>
          <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>
            {prices.length === 0 
              ? 'Ingen data hittades i databasen. Tabellen är tom. Kör update-endpointen för att hämta data från Forbrukerrådet.'
              : 'Inga poster matchar de valda filtren. Prova att ändra filterinställningarna.'
            }
          </p>
          {prices.length === 0 && (
            <button 
              onClick={triggerUpdate}
              style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Hämta data från Forbrukerrådet
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}