/**
 * Verify postnummer lookup vs Bring table (src/lib/postnrToZone.json).
 * Run: npm run test:postal-zones
 */

import { inferZoneFromPostalCode, PriceZone } from '../src/lib/electricity';
import postnrToZone from '../src/lib/postnrToZone.json';

const QA_CASES: [string, PriceZone, string][] = [
  ['0150', PriceZone.NO1, 'Oslo'],
  ['3110', PriceZone.NO2, 'Tønsberg'],
  ['3210', PriceZone.NO2, 'Sandefjord'],
  ['5501', PriceZone.NO2, 'Haugesund (5501; 5500 ikke i Bring)'],
  ['5411', PriceZone.NO2, 'Stord'],
  ['6800', PriceZone.NO3, 'Førde'],
  ['3580', PriceZone.NO5, 'Geilo'],
  ['7374', PriceZone.NO1, 'Røros'],
  ['4006', PriceZone.NO2, 'Stavanger'],
  ['7010', PriceZone.NO3, 'Trondheim'],
  ['9008', PriceZone.NO4, 'Tromsø'],
  ['5003', PriceZone.NO5, 'Bergen'],
];

/** Codes missing from postnrToZone.json — must match inferZoneFromPostalCodeRanges majority zones. */
const FALLBACK_CASES: [string, PriceZone, string][] = [
  ['2002', PriceZone.NO1, 'Akershus (ikke i Bring-tabell)'],
  ['2999', PriceZone.NO1, 'øvre 2xxx fallback'],
  ['3000', PriceZone.NO2, 'Vestfold-område fallback (ikke i tabell)'],
  ['3020', PriceZone.NO2, '3xxx fallback'],
];

function main() {
  let fails = 0;

  const tableKeys = Object.keys(postnrToZone);
  if (tableKeys.length < 5000) {
    console.error(`Expected ~5104 postnummer in table, got ${tableKeys.length}`);
    fails++;
  } else {
    console.log(`Lookup table: ${tableKeys.length} postnummer\n`);
  }

  console.log('=== QA postnummer (fra prod-verifisering) ===\n');
  for (const [code, expected, label] of QA_CASES) {
    const got = inferZoneFromPostalCode(code);
    const table = (postnrToZone as Record<string, string>)[code];
    const ok = got === expected;
    if (!ok) fails++;
    console.log(
      `${ok ? '✓' : '✗'} ${code} ${label} → ${got ?? 'undefined'} (forventet ${expected}, tabell: ${table ?? '—'})`
    );
  }

  console.log('\n=== Fallback ranges (koder uten tabelltreff) ===\n');
  for (const [code, expected, label] of FALLBACK_CASES) {
    const inTable = (postnrToZone as Record<string, string>)[code];
    if (inTable) {
      console.error(`✗ ${code} finnes i tabellen (${inTable}) — velg annen testkode`);
      fails++;
      continue;
    }
    const got = inferZoneFromPostalCode(code);
    const ok = got === expected;
    if (!ok) fails++;
    console.log(`${ok ? '✓' : '✗'} ${code} ${label} → ${got ?? 'undefined'} (forventet ${expected})`);
  }

  console.log('\n=== Leading-zero / input ===\n');
  const edges: [string, PriceZone | undefined][] = [
    ['0150', PriceZone.NO1],
    [' 0150 ', PriceZone.NO1],
    ['01500', undefined],
    ['150', undefined],
  ];
  for (const [input, expected] of edges) {
    const got = inferZoneFromPostalCode(input);
    const ok = got === expected;
    if (!ok) fails++;
    console.log(`${ok ? '✓' : '✗'} ${JSON.stringify(input)} → ${got ?? 'undefined'}`);
  }

  if (fails > 0) process.exit(1);
  console.log('\nAll checks passed.');
}

main();