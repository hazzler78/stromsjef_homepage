import { createClient } from '@supabase/supabase-js';

export interface ForbrukerrådetPrice {
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
  inserted_at: string;
}

export interface ForbrukerrådetPriceFilter {
  year?: number;
  week?: number;
  consumption?: number;
  name?: string;
  zone?: 'no1' | 'no2' | 'no3' | 'no4' | 'no5' | 'national';
  limit?: number;
}

export async function getForbrukerrådetPrices(filter: ForbrukerrådetPriceFilter = {}): Promise<ForbrukerrådetPrice[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let query = supabase
    .from('forbrukerradet_prices')
    .select('*')
    .order('year', { ascending: false })
    .order('week', { ascending: false })
    .order('created_at', { ascending: false });

  if (filter.year) {
    query = query.eq('year', filter.year);
  }
  
  if (filter.week) {
    query = query.eq('week', filter.week);
  }
  
  if (filter.consumption) {
    query = query.eq('consumption', filter.consumption);
  }
  
  if (filter.name) {
    query = query.eq('name', filter.name);
  }

  if (filter.limit) {
    query = query.limit(filter.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch Forbrukerrådet prices: ${error.message}`);
  }

  return data || [];
}

export async function getLatestForbrukerrådetPrices(limit: number = 10): Promise<ForbrukerrådetPrice[]> {
  return getForbrukerrådetPrices({ limit });
}

export async function getForbrukerrådetPricesByWeek(year: number, week: number): Promise<ForbrukerrådetPrice[]> {
  return getForbrukerrådetPrices({ year, week });
}

export async function getForbrukerrådetPricesByType(name: string, limit: number = 10): Promise<ForbrukerrådetPrice[]> {
  return getForbrukerrådetPrices({ name, limit });
}

export function getPriceForZone(price: ForbrukerrådetPrice, zone: 'no1' | 'no2' | 'no3' | 'no4' | 'no5' | 'national'): number {
  return price[zone];
}

export function formatForbrukerrådetPrice(price: number): string {
  return `${price.toFixed(2)} øre/kWh`;
}

export function getPriceTypeDisplayName(name: string): string {
  const displayNames: Record<string, string> = {
    'spot': 'Spotpris',
    'hourly_spot': 'Timspotpris',
    'fixed 1/2 year': 'Fastpris 6 måneder',
    'fixed 1 year': 'Fastpris 1 år',
    'fixed 2 years': 'Fastpris 2 år',
    'fixed 3 years': 'Fastpris 3 år',
    'fixed 5 years': 'Fastpris 5 år',
    'variable': 'Variabel pris',
    'purchase': 'Innkjøpspris',
    'plus': 'Plus-pris',
    'other': 'Annet',
  };
  
  return displayNames[name] || name;
}

export function getConsumptionDisplayName(consumption: number): string {
  if (consumption >= 1000) {
    return `${(consumption / 1000).toFixed(0)} MWh`;
  }
  return `${consumption} kWh`;
}
