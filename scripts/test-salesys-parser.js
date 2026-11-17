/**
 * SaleSys Bruttosalg parser regression (real API shape: readerId + intervals).
 * Run: npm run test:salesys-parser
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const KILDEN_KRAFT_BRUTTO_READER_ID = '679234030719d33e3566dc6c';

function isBruttosalgName(name) {
  const n = (name || '').trim().toLowerCase();
  return n === 'bruttosalg' || n.includes('bruttosalg');
}

function resolveBruttosalgReaderId(readerNames, explicitId) {
  if (explicitId) return explicitId;
  if (readerNames) {
    for (const [id, name] of Object.entries(readerNames)) {
      if (isBruttosalgName(name)) return id;
    }
  }
  return KILDEN_KRAFT_BRUTTO_READER_ID;
}

function sumIntervalValues(row) {
  const intervals = row.intervals;
  if (!Array.isArray(intervals) || intervals.length === 0) return null;
  let sum = 0;
  let any = false;
  for (const iv of intervals) {
    if (typeof iv?.value === 'number' && Number.isFinite(iv.value)) {
      sum += iv.value;
      any = true;
    }
  }
  return any ? Math.round(sum) : null;
}

function isResultsArray(payload) {
  return (
    Array.isArray(payload) &&
    payload.length > 0 &&
    typeof payload[0] === 'object' &&
    payload[0] !== null &&
    'readerId' in payload[0]
  );
}

function parseSalesysBruttosalgResults(payload, options = {}) {
  const readerNames = options.readerNames ?? {};
  const bruttoId = resolveBruttosalgReaderId(readerNames, options.bruttoReaderId);

  if (!isResultsArray(payload)) {
    return {
      grossOrders: 0,
      products: [],
      foundBruttosalg: false,
      tileNamesSample: [],
    };
  }

  const bruttoRow = bruttoId ? payload.find((r) => r.readerId === bruttoId) : undefined;
  const grossOrders = bruttoRow ? sumIntervalValues(bruttoRow) : null;
  const foundBruttosalg = Boolean(bruttoRow) && grossOrders !== null;

  const products = [];
  const seen = new Set();

  for (const row of payload) {
    if (bruttoId && row.readerId === bruttoId) continue;
    const count = sumIntervalValues(row);
    if (count === null) continue;
    const label = readerNames[row.readerId] ?? row.readerId;
    if (isBruttosalgName(label)) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    products.push({ product: label, orders: count });
  }

  return {
    grossOrders: foundBruttosalg ? grossOrders : 0,
    products: foundBruttosalg ? products : [],
    foundBruttosalg,
    tileNamesSample: payload.map((r) => readerNames[r.readerId] ?? r.readerId).slice(0, 20),
  };
}

const fixtureDir = path.join(__dirname, '../fixtures');
const readerNames = JSON.parse(
  fs.readFileSync(path.join(fixtureDir, 'salesys-reader-names-kilden.json'), 'utf8')
);

const nov15 = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'salesys-results-nov15.json'), 'utf8'));
const parsedDay = parseSalesysBruttosalgResults(nov15, { readerNames });
assert.strictEqual(parsedDay.foundBruttosalg, true);
assert.strictEqual(parsedDay.grossOrders, 2);

const range = JSON.parse(
  fs.readFileSync(path.join(fixtureDir, 'salesys-results-range-nov9-16.json'), 'utf8')
);
const parsedRange = parseSalesysBruttosalgResults(range, { readerNames });
assert.strictEqual(parsedRange.foundBruttosalg, true);
assert.strictEqual(parsedRange.grossOrders, 68);

const perDayExpected = {
  '2026-11-09': 9,
  '2026-11-10': 17,
  '2026-11-11': 25,
  '2026-11-12': 9,
  '2026-11-13': 2,
  '2026-11-14': 3,
  '2026-11-15': 2,
  '2026-11-16': 1,
};
let liveSum = 0;
const perDayParsed = {};
for (const [day, expected] of Object.entries(perDayExpected)) {
  const fixturePath = path.join(fixtureDir, `salesys-results-${day}.json`);
  assert.ok(fs.existsSync(fixturePath), `missing ${fixturePath}`);
  const payload = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const p = parseSalesysBruttosalgResults(payload, { readerNames });
  assert.strictEqual(p.grossOrders, expected, `day ${day}`);
  perDayParsed[day] = p.grossOrders;
  liveSum += p.grossOrders;
}
assert.strictEqual(liveSum, 68, 'per-day sum Nov 9-16');

console.log('test-salesys-parser: OK');
console.log(
  JSON.stringify(
    {
      nov15: parsedDay.grossOrders,
      rangeTotal: parsedRange.grossOrders,
      perDayParsed,
      liveSum,
    },
    null,
    2
  )
);