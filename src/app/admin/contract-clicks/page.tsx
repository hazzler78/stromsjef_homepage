'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';


interface ContractClick {
  id: number;
  contract_type: 'rorligt' | 'fastpris';
  log_id: number | null;
  savings_amount: number | null;
  session_id: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

interface ContractStats {
  totalClicks: number;
  rorligtClicks: number;
  fastprisClicks: number;
  withAiAnalysis: number;
  totalSavings: number;
  averageSavings: number;
  conversionRate: number;
  totalAiAnalyses: number;
  clickThroughRate: number;
}

export default function ContractClicksAdmin() {
  const [clicks, setClicks] = useState<ContractClick[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const trackingStartDate = '2025-09-13'; // Start för AI-analys-spårning
  const [clearingTestData, setClearingTestData] = useState(false);

  useEffect(() => {
    fetchContractClicks();
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearTestData = async () => {
    if (!confirm('Är du säker på att du vill ta bort ALL testdata? Detta går inte att ångra.')) {
      return;
    }

    setClearingTestData(true);
    try {
      const response = await fetch('/api/admin/clear-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Testdata har tagits bort! (${result.deletedCount} rader)`);
        fetchContractClicks(); // Refresh data
      } else {
        alert('Fel vid borttagning av testdata: ' + result.error);
        console.error('Clear test data error:', result);
      }
    } catch (error) {
      alert('Fel vid borttagning av testdata: ' + (error as Error).message);
      console.error('Clear test data error:', error);
    } finally {
      setClearingTestData(false);
    }
  };

  const fetchContractClicks = async () => {
    try {
      setLoading(true);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );
      
      // Beräkna datumfilter
      let dateFilter = '';
      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        dateFilter = `created_at.gte.${fromDate.toISOString()}`;
      }

      // Hämta klick
      let query = supabase
        .from('contract_clicks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (dateFilter) {
        query = query.gte('created_at', dateFilter.split('.')[2]);
      }

      const { data: clicksData, error: clicksError } = await query;

      if (clicksError) throw clicksError;

      setClicks(clicksData || []);

      // Beräkna statistik
      const totalClicks = clicksData?.length || 0;
      const rorligtClicks = clicksData?.filter(c => c.contract_type === 'rorligt').length || 0;
      const fastprisClicks = clicksData?.filter(c => c.contract_type === 'fastpris').length || 0;
      const withAiAnalysis = clicksData?.filter(c => c.log_id !== null).length || 0;
      
      const savingsAmounts = (clicksData || [])
        .map(c => (typeof c.savings_amount === 'number' ? c.savings_amount : 0))
        .filter(v => v > 0);
      const totalSavings = savingsAmounts.reduce((sum, amount) => sum + amount, 0);
      const averageSavings = savingsAmounts.length > 0 ? totalSavings / savingsAmounts.length : 0;
      
      // Debug: Logga besparingsdata
      console.log('Contract clicks data:', clicksData);
      console.log('Savings amounts:', savingsAmounts);
      console.log('Total savings:', totalSavings);

      // Hämta totalt antal AI-analyser (respektera trackingStartDate)
      const fromForAnalyses = (() => {
        const filterFrom = dateFilter ? dateFilter.split('.')[2] : trackingStartDate;
        return new Date(filterFrom) < new Date(trackingStartDate) ? trackingStartDate : filterFrom;
      })();
      const { count: analysesCount } = await supabase
        .from('invoice_ocr')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fromForAnalyses);

      const totalAiAnalyses = analysesCount || 0;
      const conversionRate = totalAiAnalyses > 0 ? (withAiAnalysis / totalAiAnalyses) * 100 : 0;
      const clickThroughRate = totalClicks > 0 ? (withAiAnalysis / totalClicks) * 100 : 0;

      setStats({
        totalClicks,
        rorligtClicks,
        fastprisClicks,
        withAiAnalysis,
        totalSavings,
        averageSavings,
        conversionRate,
        totalAiAnalyses,
        clickThroughRate
      });

    } catch (err) {
      setError('Kunde inte hämta data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Laddar kontraktsklick-statistik...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Fel vid hämtning av data</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '28px', fontWeight: 'bold' }}>
        Kontraktsklick-statistik
      </h1>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        border: '1px solid #cbd5e1'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '1rem' }}>
          📊 Vad spåras här?
        </h3>
        <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.4 }}>
          <strong>AI-analyser:</strong> Antal som klickar &quot;Analysera faktura&quot; på /jamfor-elpriser<br/>
          <strong>Kontraktsklick:</strong> Antal som klickar &quot;Rörligt avtal&quot; eller &quot;Fastpris&quot; efter AI-analys<br/>
          <strong>Konverteringsgrad:</strong> Hur många % av AI-användare som går vidare till kontraktsval
        </p>
      </div>

      {/* Datumfilter och rensa testdata */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Tidsperiod:</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="7d">Senaste 7 dagarna</option>
            <option value="30d">Senaste 30 dagarna</option>
            <option value="90d">Senaste 90 dagarna</option>
            <option value="all">Alla tider</option>
          </select>
        </div>

        <button
          onClick={clearTestData}
          disabled={clearingTestData}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: clearingTestData ? 'not-allowed' : 'pointer',
            opacity: clearingTestData ? 0.6 : 1
          }}
        >
          {clearingTestData ? '⏳ Rensar...' : '🗑️ Rensa testdata'}
        </button>
      </div>

      {/* Statistik-kort */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Totalt klick</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {stats.totalClicks}
            </p>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Rörligt avtal</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {stats.rorligtClicks}
            </p>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Fastpris</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {stats.fastprisClicks}
            </p>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Med AI-analys</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {stats.withAiAnalysis}
            </p>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Total besparing</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
              {formatCurrency(stats.totalSavings)}
            </p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              {stats.totalSavings > 0 ? `${(clicks || []).filter(c => c.savings_amount && c.savings_amount > 0).length} poster med besparingsdata` : 'Inga besparingsdata än'}
            </p>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>AI-analyser totalt</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {stats.totalAiAnalyses}
            </p>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Konverteringsgrad</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
              {stats.conversionRate.toFixed(1)}%
            </p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              AI-analys → Kontraktsklick
            </p>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Kvalitet på klick</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
              {stats.clickThroughRate.toFixed(1)}%
            </p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              Klick med AI-analys
            </p>
          </div>
        </div>
      )}

      {/* Detaljerad lista */}
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        <h2 style={{ 
          margin: 0, 
          padding: '1.5rem', 
          background: '#f8f9fa', 
          borderBottom: '1px solid #e0e0e0' 
        }}>
          Senaste klick ({clicks.length} st)
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Datum</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Kontraktstyp</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>AI-analys</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Besparing</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Källa</th>
                <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Session ID</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map((click, index) => (
                <tr key={click.id} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{formatDate(click.created_at)}</td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'white',
                      background: click.contract_type === 'rorligt' ? '#0066a7' : '#16a34a'
                    }}>
                      {click.contract_type === 'rorligt' ? 'Rörligt' : 'Fastpris'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>
                    {click.log_id ? (
                      <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ Ja</span>
                    ) : (
                      <span style={{ color: '#64748b' }}>Nej</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>
                    {click.savings_amount ? formatCurrency(click.savings_amount) : '-'}
                  </td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{click.source}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '13px', color: '#1e293b' }}>
                    {click.session_id ? click.session_id.slice(0, 8) + '...' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
