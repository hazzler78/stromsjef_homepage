'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface FunnelStats {
  pageViews: number;
  aiAnalyses: number;
  contractClicksWithAi: number;
  contractClicksWithoutAi: number;
}

export default function FunnelAdmin() {
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );
      let from: string | null = null;
      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        const d = new Date();
        d.setDate(d.getDate() - days);
        from = d.toISOString();
      }

      // Page views for jamfor-elpriser
      let pvQuery = supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('path', '/jamfor-elpriser');
      if (from) pvQuery = pvQuery.gte('created_at', from);
      const { count: pageViews } = await pvQuery;

      // AI analyses (invoice_ocr rows)
      let aiQuery = supabase
        .from('invoice_ocr')
        .select('*', { count: 'exact', head: true });
      if (from) aiQuery = aiQuery.gte('created_at', from);
      const { count: aiAnalyses } = await aiQuery;

      // Contract clicks
      let ccBase = supabase
        .from('contract_clicks')
        .select('*');
      if (from) ccBase = ccBase.gte('created_at', from);
      const { data: ccData, error: ccErr } = await ccBase;
      if (ccErr) throw ccErr;
      const contractClicksWithAi = (ccData || []).filter(r => r.log_id !== null).length;
      const contractClicksWithoutAi = (ccData || []).filter(r => r.log_id === null).length;

      setStats({
        pageViews: pageViews || 0,
        aiAnalyses: aiAnalyses || 0,
        contractClicksWithAi,
        contractClicksWithoutAi
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunde inte hämta data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><h1>Laddar funnel…</h1></div>;
  }

  if (error) {
    return <div style={{ padding: '2rem' }}><h1>Fel</h1><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Funnel-översikt</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Tidsperiod:</label>
        <select
          value={dateRange}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')
          }
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        >
          <option value="7d">Senaste 7 dagarna</option>
          <option value="30d">Senaste 30 dagarna</option>
          <option value="90d">Senaste 90 dagarna</option>
          <option value="all">Alla tider</option>
        </select>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '1.25rem', border: '1px solid #eee', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Besök på sidan</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.pageViews}</p>
          </div>

          <div style={{ background: 'white', padding: '1.25rem', border: '1px solid #eee', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>AI‑analyser</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.aiAnalyses}</p>
          </div>

          <div style={{ background: 'white', padding: '1.25rem', border: '1px solid #eee', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Kontraktsklick (med AI)</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.contractClicksWithAi}</p>
          </div>

          <div style={{ background: 'white', padding: '1.25rem', border: '1px solid #eee', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Kontraktsklick (utan AI)</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.contractClicksWithoutAi}</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: 8, border: '1px solid #eee', padding: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Definitioner</h2>
        <ul>
          <li>Besök: Antal page views på <code>/jamfor-elpriser</code>.</li>
          <li>AI‑analyser: Antal analyser körda (rader i <code>invoice_ocr</code>).</li>
          <li>Kontraktsklick med AI: Klick där <code>log_id</code> finns.</li>
          <li>Kontraktsklick utan AI: Klick där <code>log_id</code> saknas.</li>
        </ul>
      </div>
    </div>
  );
}


