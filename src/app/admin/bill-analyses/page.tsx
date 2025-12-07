'use client';
import { useState, useEffect } from 'react';

interface BillAnalysis {
  id: number;
  session_id: string;
  invoice_ocr_id: number;
  file_name: string;
  file_size: number;
  total_electricity_cost: number;
  total_extra_fees: number;
  potential_savings: number;
  analysis_summary: string;
  consent_to_store: boolean;
  analysis_confirmed: boolean;
  is_correct: boolean | null;
  correction_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface BillAnalysisStats {
  total_analyses: number;
  total_savings: number;
  average_savings: number;
  confirmed_analyses: number;
  correction_rate: number;
}

export default function BillAnalysesAdmin() {
  const [analyses, setAnalyses] = useState<BillAnalysis[]>([]);
  const [stats, setStats] = useState<BillAnalysisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bill-analyses');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analyses');
      }
      
      setAnalyses(data.analyses || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (analysis: BillAnalysis) => {
    if (analysis.is_correct === true) {
      return <span style={{ 
        display: 'inline-block', 
        padding: '4px 12px', 
        borderRadius: '6px', 
        background: '#dcfce7', 
        color: '#166534', 
        fontSize: '13px', 
        fontWeight: '600' 
      }}>Bekreftet</span>;
    } else if (analysis.is_correct === false) {
      return <span style={{ 
        display: 'inline-block', 
        padding: '4px 12px', 
        borderRadius: '6px', 
        background: '#fee2e2', 
        color: '#991b1b', 
        fontSize: '13px', 
        fontWeight: '600' 
      }}>Korreksjon</span>;
    } else {
      return <span style={{ 
        display: 'inline-block', 
        padding: '4px 12px', 
        borderRadius: '6px', 
        background: '#fef3c7', 
        color: '#92400e', 
        fontSize: '13px', 
        fontWeight: '600' 
      }}>Venter</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24, background: 'white', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Laddar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24, background: 'white', minHeight: '100vh' }}>
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '16px', 
          borderRadius: '8px' 
        }}>
          <strong>Fel:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24, background: 'white', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: '#1e293b', marginBottom: 8, fontSize: '28px', fontWeight: 'bold' }}>Elräkning Analyser</h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Oversikt over alle AI-analyser av elräkninger</p>
      </div>

      {/* Statistikk */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Totalt analyser</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0066a7' }}>{stats.total_analyses}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Total besparing</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(stats.total_savings)}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Gjennomsnitt</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0891b2' }}>{formatCurrency(stats.average_savings)}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Bekreftet</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ea580c' }}>{stats.confirmed_analyses}</div>
          </div>
        </div>
      )}

      {/* Tabell */}
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '14px', minWidth: '1000px' }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Fil</th>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Elkostnad</th>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Extraavgifter</th>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'right', color: 'white', fontWeight: '600' }}>Besparing</th>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'center', color: 'white', fontWeight: '600' }}>Samtykke</th>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Dato</th>
              <th style={{ padding: '12px', border: '1px solid #334155', textAlign: 'left', color: 'white', fontWeight: '600' }}>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis, index) => (
              <tr key={analysis.id} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px' }}>{analysis.id}</td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600', marginBottom: 4 }}>{analysis.file_name}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {(analysis.file_size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontFamily: 'monospace' }}>
                  {formatCurrency(analysis.total_electricity_cost)}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#1e293b', fontFamily: 'monospace' }}>
                  {formatCurrency(analysis.total_extra_fees)}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#16a34a', fontFamily: 'monospace', fontWeight: '700' }}>
                  {formatCurrency(analysis.potential_savings)}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>{getStatusBadge(analysis)}</td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#1e293b' }}>
                  {analysis.consent_to_store ? (
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '3px 10px', 
                      borderRadius: '6px', 
                      background: '#dcfce7', 
                      color: '#166534', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>Ja</span>
                  ) : (
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '3px 10px', 
                      borderRadius: '6px', 
                      background: '#fee2e2', 
                      color: '#991b1b', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>Nei</span>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b', fontSize: '13px' }}>{formatDate(analysis.created_at)}</td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#1e293b' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid #cbd5e1', 
                        background: 'white', 
                        color: '#1e293b', 
                        fontWeight: '500', 
                        cursor: 'pointer', 
                        fontSize: '13px' 
                      }}
                      onClick={() => {
                        // TODO: Implement view details modal
                        alert(`Analys ID: ${analysis.id}\n\n${analysis.analysis_summary}`);
                      }}
                    >
                      Se detaljer
                    </button>
                    {analysis.invoice_ocr_id && (
                      <button 
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid #cbd5e1', 
                          background: 'white', 
                          color: '#1e293b', 
                          fontWeight: '500', 
                          cursor: 'pointer', 
                          fontSize: '13px' 
                        }}
                        onClick={() => {
                          window.open(`/api/invoice-ocr/file-url?invoiceId=${analysis.invoice_ocr_id}`, '_blank');
                        }}
                      >
                        Se bilde
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {analyses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ color: '#64748b', fontSize: '16px' }}>
            Ingen analyser funnet. Prøv å analysere en elräkning først.
          </div>
        </div>
      )}
    </div>
  );
}
