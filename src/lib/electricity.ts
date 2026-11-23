export enum PriceZone {
  ALL = 'ALL',
  NO1 = 'NO1',
  NO2 = 'NO2',
  NO3 = 'NO3',
  NO4 = 'NO4',
  NO5 = 'NO5'
}

export interface ElectricityPlan {
  id: string;
  supplierName: string;
  planName: string;
  pricePerKwh: number; // öre/kWh or NOK øre/kWh depending on context
  monthlyFee: number; // NOK per month
  bindingTime: number; // months
  bindingTimeText?: string;
  termsGuarantee?: string;
  guaranteeDisclaimer?: string;
  terminationFee?: number; // NOK
  priceZone: PriceZone;
  logoUrl?: string;
  affiliateLink?: string;
  featured?: boolean;
  sortOrder?: number;
}

import postnrToZoneData from './postnrToZone.json';

const postnrToZone = postnrToZoneData as Record<string, PriceZone>;

/** Coarse fallback when a valid 4-digit code is missing from the Bring-based table (rare). */
function inferZoneFromPostalCodeRanges(n: number): PriceZone | undefined {
  if (n >= 0 && n <= 1999) return PriceZone.NO1;
  if (n >= 2000 && n <= 2999) return PriceZone.NO1;
  if (n >= 3000 && n <= 3999) return PriceZone.NO2;
  if (n >= 4000 && n <= 4999) return PriceZone.NO2;
  if (n >= 5000 && n <= 5999) return PriceZone.NO5;
  if (n >= 6000 && n <= 6999) return PriceZone.NO3;
  if (n >= 7000 && n <= 7999) return PriceZone.NO3;
  if (n >= 8000 && n <= 9999) return PriceZone.NO4;
  return undefined;
}

/** Map Norwegian postnummer (4 digits, leading zeros allowed) to bidding zone NO1–NO5. */
export function inferZoneFromPostalCode(postalCode: string): PriceZone | undefined {
  if (postalCode == null) return undefined;
  const code = String(postalCode).replace(/\s+/g, '');
  if (!/^\d{4}$/.test(code)) return undefined;

  const fromTable = postnrToZone[code];
  if (fromTable) return fromTable;

  return inferZoneFromPostalCodeRanges(parseInt(code, 10));
}

/** When catalog rows exist for both a zone and ALL, keep the zone-specific price row. */
export function preferZoneSpecificPlans<T extends { supplierName: string; planName: string; priceZone: PriceZone }>(
  plans: T[],
  zone: PriceZone
): T[] {
  if (zone === PriceZone.ALL) return plans;

  const byKey = new Map<string, T[]>();
  for (const plan of plans) {
    const key = `${plan.supplierName}\u0000${plan.planName}`;
    const list = byKey.get(key) ?? [];
    list.push(plan);
    byKey.set(key, list);
  }

  const result: T[] = [];
  for (const group of byKey.values()) {
    const zoneSpecific = group.find((p) => p.priceZone === zone);
    if (zoneSpecific) {
      result.push(zoneSpecific);
      continue;
    }
    const national = group.find((p) => p.priceZone === PriceZone.ALL);
    if (national) {
      result.push(national);
      continue;
    }
    result.push(...group);
  }
  return result;
}

export const mockElectricityPlans: ElectricityPlan[] = [
  // Cheap Energy Norge Spotpris
  {
    id: 'ce-spot-no1',
    supplierName: 'Cheap Energy',
    planName: 'Spotpris',
    pricePerKwh: -1.7,
    monthlyFee: 0,
    bindingTime: 0,
    termsGuarantee: '12 måneder',
    guaranteeDisclaimer: 'Etter utløpt vilkårsgaranti løper avtalen videre på like vilkår hvis ikke andre endringer blir varslet.',
    priceZone: PriceZone.NO1,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-spot/?utm_source=stromsjef.no&utm_medium=affiliate',
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'ce-spot-no2',
    supplierName: 'Cheap Energy',
    planName: 'Spotpris',
    pricePerKwh: -1.7,
    monthlyFee: 0,
    bindingTime: 0,
    termsGuarantee: '12 måneder',
    guaranteeDisclaimer: 'Etter utløpt vilkårsgaranti løper avtalen videre på like vilkår hvis ikke andre endringer blir varslet.',
    priceZone: PriceZone.NO2,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-spot/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-spot-no3',
    supplierName: 'Cheap Energy',
    planName: 'Spotpris',
    pricePerKwh: -1.7,
    monthlyFee: 0,
    bindingTime: 0,
    termsGuarantee: '12 måneder',
    guaranteeDisclaimer: 'Etter utløpt vilkårsgaranti løper avtalen videre på like vilkår hvis ikke andre endringer blir varslet.',
    priceZone: PriceZone.NO3,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-spot/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-spot-no4',
    supplierName: 'Cheap Energy',
    planName: 'Spotpris',
    pricePerKwh: -1.7,
    monthlyFee: 0,
    bindingTime: 0,
    termsGuarantee: '12 måneder',
    guaranteeDisclaimer: 'Etter utløpt vilkårsgaranti løper avtalen videre på like vilkår hvis ikke andre endringer blir varslet.',
    priceZone: PriceZone.NO4,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-spot/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-spot-no5',
    supplierName: 'Cheap Energy',
    planName: 'Spotpris',
    pricePerKwh: -1.7,
    monthlyFee: 0,
    bindingTime: 0,
    termsGuarantee: '12 måneder',
    guaranteeDisclaimer: 'Etter utløpt vilkårsgaranti løper avtalen videre på like vilkår hvis ikke andre endringer blir varslet.',
    priceZone: PriceZone.NO5,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-spot/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  // Cheap Energy Norge Fastpris 69,9
  {
    id: 'ce-fast69-no1',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 69,9',
    pricePerKwh: 69.9,
    monthlyFee: 0,
    bindingTime: 12,
    bindingTimeText: 'Til 01.10.2025',
    priceZone: PriceZone.NO1,
    terminationFee: 1,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast/?utm_source=stromsjef.no&utm_medium=affiliate',
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'ce-fast69-no2',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 69,9',
    pricePerKwh: 69.9,
    monthlyFee: 0,
    bindingTime: 12,
    bindingTimeText: 'Til 01.10.2025',
    priceZone: PriceZone.NO2,
    terminationFee: 1,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-fast69-no3',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 69,9',
    pricePerKwh: 69.9,
    monthlyFee: 0,
    bindingTime: 12,
    bindingTimeText: 'Til 01.10.2025',
    priceZone: PriceZone.NO3,
    terminationFee: 1,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-fast69-no4',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 69,9',
    pricePerKwh: 69.9,
    monthlyFee: 0,
    bindingTime: 12,
    bindingTimeText: 'Til 01.10.2025',
    priceZone: PriceZone.NO4,
    terminationFee: 1,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-fast69-no5',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 69,9',
    pricePerKwh: 69.9,
    monthlyFee: 0,
    bindingTime: 12,
    bindingTimeText: 'Til 01.10.2025',
    priceZone: PriceZone.NO5,
    terminationFee: 1,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  // Cheap Energy Norge Fastpris 96,9
  {
    id: 'ce-fast96-no1',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 96,9',
    pricePerKwh: 96.9,
    monthlyFee: 0,
    bindingTime: 12,
    priceZone: PriceZone.NO1,
    terminationFee: 1490,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast-12/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-fast96-no2',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 96,9',
    pricePerKwh: 96.9,
    monthlyFee: 0,
    bindingTime: 12,
    priceZone: PriceZone.NO2,
    terminationFee: 1490,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast-12/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-fast96-no3',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 96,9',
    pricePerKwh: 96.9,
    monthlyFee: 0,
    bindingTime: 12,
    priceZone: PriceZone.NO3,
    terminationFee: 1490,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast-12/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-fast96-no4',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 96,9',
    pricePerKwh: 96.9,
    monthlyFee: 0,
    bindingTime: 12,
    priceZone: PriceZone.NO4,
    terminationFee: 1490,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast-12/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  {
    id: 'ce-fast96-no5',
    supplierName: 'Cheap Energy',
    planName: 'Fastpris 96,9',
    pricePerKwh: 96.9,
    monthlyFee: 0,
    bindingTime: 12,
    priceZone: PriceZone.NO5,
    terminationFee: 1490,
    logoUrl: '/logos/cheap-energy.png',
    affiliateLink: 'https://cheapenergy.no/privat/cheap-fast-12/?utm_source=stromsjef.no&utm_medium=affiliate',
  },
  // Kilden Kraft Fastpris 3 år (NO1-NO5)
  {
    id: '8',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 3 år',
    pricePerKwh: 104.90,
    monthlyFee: 0,
    bindingTime: 36,
    priceZone: PriceZone.NO1,
    terminationFee: 2490,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-3-ar/?utm_source=stromsjef.no',
  },
  {
    id: '9',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 3 år',
    pricePerKwh: 114.90,
    monthlyFee: 0,
    bindingTime: 36,
    priceZone: PriceZone.NO2,
    terminationFee: 2490,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-3-ar/?utm_source=stromsjef.no',
  },
  {
    id: '10',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 3 år',
    pricePerKwh: 60.90,
    monthlyFee: 0,
    bindingTime: 36,
    priceZone: PriceZone.NO3,
    terminationFee: 2490,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-3-ar/?utm_source=stromsjef.no',
  },
  {
    id: '11',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 3 år',
    pricePerKwh: 47.38,
    monthlyFee: 0,
    bindingTime: 36,
    priceZone: PriceZone.NO4,
    terminationFee: 2490,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-3-ar/?utm_source=stromsjef.no',
  },
  {
    id: '12',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 3 år',
    pricePerKwh: 104.90,
    monthlyFee: 0,
    bindingTime: 36,
    priceZone: PriceZone.NO5,
    terminationFee: 2490,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-3-ar/?utm_source=stromsjef.no',
  },
  // Kilden Kraft Fastpris 6 mnd
  {
    id: 'kk-fast6-no1',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 6 mnd',
    pricePerKwh: 79.90,
    monthlyFee: 0,
    bindingTime: 6,
    terminationFee: 1490,
    priceZone: PriceZone.NO1,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-6-mnd/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast6-no2',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 6 mnd',
    pricePerKwh: 79.90,
    monthlyFee: 0,
    bindingTime: 6,
    terminationFee: 1490,
    priceZone: PriceZone.NO2,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-6-mnd/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast6-no3',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 6 mnd',
    pricePerKwh: 79.90,
    monthlyFee: 0,
    bindingTime: 6,
    terminationFee: 1490,
    priceZone: PriceZone.NO3,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-6-mnd/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast6-no4',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 6 mnd',
    pricePerKwh: 79.88,
    monthlyFee: 0,
    bindingTime: 6,
    terminationFee: 1490,
    priceZone: PriceZone.NO4,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-6-mnd/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast6-no5',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 6 mnd',
    pricePerKwh: 79.90,
    monthlyFee: 0,
    bindingTime: 6,
    terminationFee: 1490,
    priceZone: PriceZone.NO5,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-6-mnd/?utm_source=stromsjef.no',
  },
  // Kilden Kraft Fastpris 2 år
  {
    id: 'kk-fast24-no1',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 2 år',
    pricePerKwh: 102.90,
    monthlyFee: 0,
    bindingTime: 24,
    terminationFee: 2490,
    priceZone: PriceZone.NO1,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-2-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast24-no2',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 2 år',
    pricePerKwh: 109.90,
    monthlyFee: 0,
    bindingTime: 24,
    terminationFee: 2490,
    priceZone: PriceZone.NO2,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-2-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast24-no3',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 2 år',
    pricePerKwh: 59.90,
    monthlyFee: 0,
    bindingTime: 24,
    terminationFee: 2490,
    priceZone: PriceZone.NO3,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-2-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast24-no4',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 2 år',
    pricePerKwh: 46.13,
    monthlyFee: 0,
    bindingTime: 24,
    terminationFee: 2490,
    priceZone: PriceZone.NO4,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-2-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast24-no5',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 2 år',
    pricePerKwh: 102.90,
    monthlyFee: 0,
    bindingTime: 24,
    terminationFee: 2490,
    priceZone: PriceZone.NO5,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-2-ar/?utm_source=stromsjef.no',
  },
  // Kilden Kraft Fastpris 1 år
  {
    id: 'kk-fast12-no1',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 1 år',
    pricePerKwh: 99.90,
    monthlyFee: 0,
    bindingTime: 12,
    terminationFee: 1490,
    priceZone: PriceZone.NO1,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast12-no2',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 1 år',
    pricePerKwh: 99.90,
    monthlyFee: 0,
    bindingTime: 12,
    terminationFee: 1490,
    priceZone: PriceZone.NO2,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast12-no3',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 1 år',
    pricePerKwh: 51.90,
    monthlyFee: 0,
    bindingTime: 12,
    terminationFee: 1490,
    priceZone: PriceZone.NO3,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast12-no4',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 1 år',
    pricePerKwh: 39.88,
    monthlyFee: 0,
    bindingTime: 12,
    terminationFee: 1490,
    priceZone: PriceZone.NO4,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast12-no5',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 1 år',
    pricePerKwh: 99.90,
    monthlyFee: 0,
    bindingTime: 12,
    terminationFee: 1490,
    priceZone: PriceZone.NO5,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
  },
  // Kilden Kraft Fastpris 5 år
  {
    id: 'kk-fast60-no1',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 5 år',
    pricePerKwh: 109.90,
    monthlyFee: 0,
    bindingTime: 60,
    terminationFee: 3490,
    priceZone: PriceZone.NO1,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-5-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast60-no2',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 5 år',
    pricePerKwh: 119.90,
    monthlyFee: 0,
    bindingTime: 60,
    terminationFee: 3490,
    priceZone: PriceZone.NO2,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-5-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast60-no3',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 5 år',
    pricePerKwh: 69.90,
    monthlyFee: 0,
    bindingTime: 60,
    terminationFee: 3490,
    priceZone: PriceZone.NO3,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-5-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast60-no4',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 5 år',
    pricePerKwh: 56.13,
    monthlyFee: 0,
    bindingTime: 60,
    terminationFee: 3490,
    priceZone: PriceZone.NO4,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-5-ar/?utm_source=stromsjef.no',
  },
  {
    id: 'kk-fast60-no5',
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 5 år',
    pricePerKwh: 109.90,
    monthlyFee: 0,
    bindingTime: 60,
    terminationFee: 3490,
    priceZone: PriceZone.NO5,
    logoUrl: '/logos/kilden-kraft.png',
    affiliateLink: 'https://kildenkraft.no/privat/fastpris-5-ar/?utm_source=stromsjef.no',
  },
];

/**
 * Maps supplier names to their corresponding logo file paths.
 * This function provides a fallback when logo_url is not set in the database.
 */
export function getSupplierLogoUrl(supplierName: string): string {
  if (!supplierName) return '/favicon.svg';
  
  // Normalize supplier name: lowercase, remove extra spaces, handle common variations
  const normalized = supplierName.toLowerCase().trim();
  
  // Map supplier names to logo files
  const logoMap: Record<string, string> = {
    'cheap energy': '/logos/cheap-energy.png',
    'kilden kraft': '/logos/kilden-kraft.png',
    'barum energi': '/logos/barum-energi.png',
    'barum': '/logos/barum-energi.png',
    'vstrom': '/logos/vstrom.png',
    'v strom': '/logos/vstrom.png',
    'fortum': '/logos/fortum.png',
    'ishavskraft': '/logos/ishavskraft.png',
    'ishavs kraft': '/logos/ishavskraft.png',
    'tibber': '/logos/tibber.png',
  };
  
  // Direct match
  if (logoMap[normalized]) {
    return logoMap[normalized];
  }
  
  // Partial match - check if any key is contained in the supplier name
  for (const [key, logoPath] of Object.entries(logoMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return logoPath;
    }
  }
  
  // Default fallback
  return '/favicon.svg';
}


