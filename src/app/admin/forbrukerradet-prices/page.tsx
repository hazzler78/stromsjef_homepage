'use client';

import { useState, useEffect } from 'react';
import { getForbrukerrådetPrices, getLatestForbrukerrådetPrices, ForbrukerrådetPrice, getPriceTypeDisplayName, getConsumptionDisplayName, formatForbrukerrådetPrice } from '@/lib/forbrukerradetService';
import Link from 'next/link';

export default function ForbrukerrådetPricesPage() {
  const [prices, setPrices] = useState<ForbrukerrådetPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    year: new Date().getFullYear(),
    week: 0,
    consumption: 0,
    name: '',
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      setLoading(true);
      const data = await getLatestForbrukerrådetPrices(50);
      setPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const data = await getForbrukerrådetPrices({
        year: filter.year || undefined,
        week: filter.week || undefined,
        consumption: filter.consumption || undefined,
        name: filter.name || undefined,
        limit: 100,
      });
      setPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter prices');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueValues = (key: keyof ForbrukerrådetPrice) => {
    const values = [...new Set(prices.map(p => p[key]))].sort();
    return values;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ← Tillbaka till Admin
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📊 Forbrukerrådet Priser</h1>
                <p className="text-gray-600 mt-1">Prisdata från Forbrukerrådets strømprisportal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Senast uppdaterad: {new Date().toLocaleString('sv-SE')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Error State */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Fel vid laddning</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <div className="text-lg font-medium text-gray-900">Laddar priser...</div>
                <div className="text-sm text-gray-500">Hämtar data från Forbrukerrådet</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filter & Sök</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">År</label>
                <select
                  value={filter.year}
                  onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                >
                  {getUniqueValues('year').map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uke</label>
                <select
                  value={filter.week}
                  onChange={(e) => setFilter({ ...filter, week: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                >
                  <option value={0}>Alle uker</option>
                  {getUniqueValues('week').map(week => (
                    <option key={week} value={week}>Uke {week}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forbruk</label>
                <select
                  value={filter.consumption}
                  onChange={(e) => setFilter({ ...filter, consumption: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Pristype</label>
                <select
                  value={filter.name}
                  onChange={(e) => setFilter({ ...filter, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                >
                  <option value="">Alle typer</option>
                  {getUniqueValues('name').map(name => (
                    <option key={name} value={name}>{getPriceTypeDisplayName(String(name))}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleFilter}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filtrer
              </button>
              <button
                onClick={loadPrices}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>

          {/* Results Summary */}
          {!loading && !error && (
            <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-indigo-900">
                    📊 Visar {filteredPrices.length} av {prices.length} priser
                  </div>
                  {filteredPrices.length !== prices.length && (
                    <div className="text-sm text-indigo-700">
                      (filtrerat från {prices.length} totalt)
                    </div>
                  )}
                </div>
                <div className="text-sm text-indigo-600">
                  Senast uppdaterad: {prices.length > 0 ? new Date(prices[0].createdAt).toLocaleString('sv-SE') : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">📅 År/Uke</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">⚡ Forbruk</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">🏷️ Pristype</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">📍 NO1</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">📍 NO2</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">📍 NO3</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">📍 NO4</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">📍 NO5</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">🇳🇴 Nasjonalt</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">🕒 Oppdatert</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrices.map((price, index) => (
                    <tr key={price.id} className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {price.year}
                          </div>
                          <div className="ml-2 text-sm text-gray-500">
                            Uke {price.week}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getConsumptionDisplayName(Number(price.consumption))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getPriceTypeDisplayName(String(price.name))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {formatForbrukerrådetPrice(price.no1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {formatForbrukerrådetPrice(price.no2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {formatForbrukerrådetPrice(price.no3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {formatForbrukerrådetPrice(price.no4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {formatForbrukerrådetPrice(price.no5)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-indigo-900">
                        {formatForbrukerrådetPrice(price.national)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <div>{new Date(price.createdAt).toLocaleDateString('sv-SE')}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(price.createdAt).toLocaleTimeString('sv-SE')}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredPrices.length === 0 && !loading && !error && (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-lg font-medium text-gray-900">Ingen data funnet</div>
                <div className="text-sm text-gray-500">Prova att ändra filterinställningarna</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

