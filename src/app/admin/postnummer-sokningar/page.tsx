"use client";
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const getSupabase = () => createClient(supabaseUrl as string, supabaseKey as string);

const ADMIN_PASSWORD = "grodan2025";

type PostalCodeSearch = {
  id: number;
  created_at: string;
  postal_code: string | null;
  price_zone: string | null;
  zone_source: string | null;
  page_path: string | null;
  session_id: string | null;
  user_agent: string | null;
  referer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  plans_shown: number | null;
  clicked_plan: boolean;
  clicked_supplier: string | null;
};

type SearchAnalytics = {
  totalSearches: number;
  searchesByDay: { date: string; count: number }[];
  searchesByPostalCode: { postalCode: string; count: number }[];
  searchesByZone: { zone: string; count: number }[];
  searchesByPage: { page: string; count: number }[];
  searchesByUtmSource: { source: string; count: number }[];
  searchesByUtmCampaign: { campaign: string; count: number }[];
  clickThroughRate: number;
  topSuppliers: { supplier: string; count: number }[];
};

export default function AdminPostnummerSokningar() {
  const [searches, setSearches] = useState<PostalCodeSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  const calculateAnalytics = useCallback((data: PostalCodeSearch[]) => {
    const filtered = data.filter(search => {
      if (!dateFrom && !dateTo) return true;
      const searchDate = new Date(search.created_at).getTime();
      const fromOk = !dateFrom || searchDate >= new Date(dateFrom).getTime();
      const toOk = !dateTo || searchDate <= new Date(dateTo).getTime() + 24*60*60*1000 - 1;
      return fromOk && toOk;
    });

    // Group by day
    const byDay = filtered.reduce((acc, search) => {
      const date = search.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const searchesByDay = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group by postal code
    const byPostalCode = filtered.reduce((acc, search) => {
      const code = search.postal_code || 'Okänt';
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const searchesByPostalCode = Object.entries(byPostalCode)
      .map(([postalCode, count]) => ({ postalCode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20

    // Group by zone
    const byZone = filtered.reduce((acc, search) => {
      const zone = search.price_zone || 'Okänt';
      acc[zone] = (acc[zone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const searchesByZone = Object.entries(byZone)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count);

    // Group by page
    const byPage = filtered.reduce((acc, search) => {
      const page = search.page_path || 'Okänt';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const searchesByPage = Object.entries(byPage)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count);

    // Group by UTM source
    const byUtmSource = filtered.reduce((acc, search) => {
      const source = search.utm_source || 'Ingen UTM';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const searchesByUtmSource = Object.entries(byUtmSource)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group by UTM campaign
    const byUtmCampaign = filtered.reduce((acc, search) => {
      const campaign = search.utm_campaign || 'Ingen kampanj';
      acc[campaign] = (acc[campaign] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const searchesByUtmCampaign = Object.entries(byUtmCampaign)
      .map(([campaign, count]) => ({ campaign, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Click-through rate
    const totalSearches = filtered.length;
    const clicks = filtered.filter(s => s.clicked_plan).length;
    const clickThroughRate = totalSearches > 0 ? (clicks / totalSearches) * 100 : 0;

    // Top suppliers
    const bySupplier = filtered
      .filter(s => s.clicked_supplier)
      .reduce((acc, search) => {
        const supplier = search.clicked_supplier || 'Okänt';
        acc[supplier] = (acc[supplier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topSuppliers = Object.entries(bySupplier)
      .map(([supplier, count]) => ({ supplier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setAnalytics({
      totalSearches,
      searchesByDay,
      searchesByPostalCode,
      searchesByZone,
      searchesByPage,
      searchesByUtmSource,
      searchesByUtmCampaign,
      clickThroughRate,
      topSuppliers
    });
  }, [dateFrom, dateTo]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('postal_code_searches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching searches:', error);
        setError(`Databasfel: ${error.message}`);
        return;
      }

      setSearches(data as PostalCodeSearch[]);
      calculateAnalytics(data as PostalCodeSearch[]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Ett fel uppstod: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  }, [calculateAnalytics]);

  useEffect(() => {
    if (!authed) return;
    fetchData();
  }, [authed, fetchData]);

  useEffect(() => {
    if (searches.length > 0) {
      calculateAnalytics(searches);
    }
  }, [dateFrom, dateTo, calculateAnalytics, searches]);

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

  function quickRange(days: number) {
    const to = new Date();
    const from = new Date(Date.now() - days*24*60*60*1000);
    setDateFrom(from.toISOString().slice(0,10));
    setDateTo(to.toISOString().slice(0,10));
  }

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
  }

  function exportCsv() {
    if (searches.length === 0) return;
    
    const headers = ['Datum', 'Postnummer', 'Strømområde', 'Källa', 'Sida', 'Session ID', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Avtaler visade', 'Klickade', 'Leverantör'];
    const csv = [headers.join(',')]
      .concat(searches.map(s => [
        s.created_at,
        s.postal_code || '',
        s.price_zone || '',
        s.zone_source || '',
        s.page_path || '',
        s.session_id || '',
        s.utm_source || '',
        s.utm_medium || '',
        s.utm_campaign || '',
        s.plans_shown || 0,
        s.clicked_plan ? 'Ja' : 'Nej',
        s.clicked_supplier || ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postnummer_sokningar.csv';
    a.click();
    URL.revokeObjectURL(url);
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

  return (
    <div style={{ maxWidth: 1400, margin: '2rem auto', padding: 24, background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: '#1e293b', marginBottom: 8 }}>Postnummer-sökningar</h1>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 12, fontSize: '16px' }}>
        Översikt över alla postnummer-sökningar för marknadsföringsanalys
      </p>

      {/* Filters and Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <button onClick={fetchData} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Uppdatera</button>
        <button onClick={() => quickRange(1)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>24h</button>
        <button onClick={() => quickRange(7)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>7d</button>
        <button onClick={() => quickRange(30)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>30d</button>
        <button onClick={clearFilters} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Rensa</button>
        <button onClick={exportCsv} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Export CSV</button>
      </div>

      {loading && <p>Laddar...</p>}

      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          <strong>Fel:</strong> {error}
        </div>
      )}

      {!loading && !error && searches.length === 0 && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          color: '#0369a1', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          <strong>Ingen data:</strong> Det finns inga postnummer-sökningar i databasen ännu.
        </div>
      )}

      {!loading && analytics && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Totalt antal sökningar</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{analytics.totalSearches}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Klickfrekvens</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{analytics.clickThroughRate.toFixed(1)}%</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Unika postnummer</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{analytics.searchesByPostalCode.length}</div>
            </div>
          </div>

          {/* Top Postal Codes */}
          {analytics.searchesByPostalCode.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Topp 20 postnummer</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Postnummer</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Antal sökningar</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Procent</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.searchesByPostalCode.map((item, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>{item.postalCode}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{item.count}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>
                        {((item.count / analytics.totalSearches) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Searches by Zone */}
          {analytics.searchesByZone.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Sökningar per strømområde</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Strømområde</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Antal</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Procent</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.searchesByZone.map((item, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>{item.zone}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{item.count}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>
                        {((item.count / analytics.totalSearches) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Searches by Page */}
          {analytics.searchesByPage.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Sökningar per sida</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Sida</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Antal</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.searchesByPage.map((item, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>{item.page}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* UTM Sources */}
          {analytics.searchesByUtmSource.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Topp 10 UTM Sources</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>UTM Source</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Antal</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.searchesByUtmSource.map((item, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>{item.source}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top Suppliers */}
          {analytics.topSuppliers.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Topp 10 leverantörer (klickade)</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Leverantör</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Antal klick</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topSuppliers.map((item, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>{item.supplier}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Daily Trend */}
          {analytics.searchesByDay.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Daglig trend</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Datum</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Antal</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.searchesByDay.slice(-14).map((item, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>{item.date}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent Searches */}
          <div>
            <h2 style={{ color: '#1e293b', marginBottom: 12, fontSize: '20px', fontWeight: '600' }}>Senaste sökningar</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Datum</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Postnummer</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Strømområde</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Sida</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Avtaler</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'center', color: 'white', fontWeight: '600' }}>Klickade</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Leverantör</th>
                    <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>UTM Source</th>
                  </tr>
                </thead>
                <tbody>
                  {searches.slice(0, 50).map((search, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>
                        {new Date(search.created_at).toLocaleString('sv-SE')}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>{search.postal_code || '-'}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>{search.price_zone || '-'}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>{search.page_path || '-'}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b' }}>{search.plans_shown || 0}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#1e293b', fontSize: '18px' }}>
                        {search.clicked_plan ? '✅' : '❌'}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>{search.clicked_supplier || '-'}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>{search.utm_source || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
