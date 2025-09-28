'use client';
import { useState, useEffect } from 'react';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

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
      return <span className="badge badge-success">Bekreftet</span>;
    } else if (analysis.is_correct === false) {
      return <span className="badge badge-error">Korreksjon</span>;
    } else {
      return <span className="badge badge-warning">Venter</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="alert alert-error">
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Elräkning Analyser</h1>
        <p className="text-gray-600">Oversikt over alle AI-analyser av elräkninger</p>
      </div>

      {/* Statistikk */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Totalt analyser</div>
            <div className="stat-value text-primary">{stats.total_analyses}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Total besparing</div>
            <div className="stat-value text-success">{formatCurrency(stats.total_savings)}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Gjennomsnitt</div>
            <div className="stat-value text-info">{formatCurrency(stats.average_savings)}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Bekreftet</div>
            <div className="stat-value text-warning">{stats.confirmed_analyses}</div>
          </div>
        </div>
      )}

      {/* Tabell */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fil</th>
              <th>Elkostnad</th>
              <th>Extraavgifter</th>
              <th>Besparing</th>
              <th>Status</th>
              <th>Samtykke</th>
              <th>Dato</th>
              <th>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr key={analysis.id}>
                <td className="font-mono text-sm">{analysis.id}</td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-medium">{analysis.file_name}</span>
                    <span className="text-xs text-gray-500">
                      {(analysis.file_size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </td>
                <td className="font-mono">
                  {formatCurrency(analysis.total_electricity_cost)}
                </td>
                <td className="font-mono">
                  {formatCurrency(analysis.total_extra_fees)}
                </td>
                <td className="font-mono text-success font-bold">
                  {formatCurrency(analysis.potential_savings)}
                </td>
                <td>{getStatusBadge(analysis)}</td>
                <td>
                  {analysis.consent_to_store ? (
                    <span className="badge badge-success badge-sm">Ja</span>
                  ) : (
                    <span className="badge badge-error badge-sm">Nei</span>
                  )}
                </td>
                <td className="text-sm">{formatDate(analysis.created_at)}</td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-xs btn-outline"
                      onClick={() => {
                        // TODO: Implement view details modal
                        alert(`Analys ID: ${analysis.id}\n\n${analysis.analysis_summary}`);
                      }}
                    >
                      Se detaljer
                    </button>
                    {analysis.invoice_ocr_id && (
                      <button 
                        className="btn btn-xs btn-outline"
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
        <div className="text-center py-12">
          <div className="text-gray-500">
            Ingen analyser funnet. Prøv å analysere en elräkning først.
          </div>
        </div>
      )}
    </div>
  );
}
