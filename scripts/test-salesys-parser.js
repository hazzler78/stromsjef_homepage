/**
 * SaleSys Bruttosalg parser regression test (fixture only — no live API).
 * Run: node scripts/test-salesys-parser.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mirror of src/lib/salesysDashboard.ts parseSalesysBruttosalgResults (pure JS for node)

function normalizeName(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function isBruttosalgName(name) {
  const n = normalizeName(name);
  return n === 'bruttosalg' || n.includes('bruttosalg');
}

function readOrderCount(node) {
  if (!node || typeof node !== 'object') return null;
  const candidates = [
    node.value,
    node.count,
    node.total,
    node.orders,
    node.orderCount,
    node.data?.value,
    node.data?.count,
    node.result?.value,
  ];
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return Math.round(c);
    if (typeof c === 'string' && c.trim() !== '' && Number.isFinite(Number(c))) {
      return Math.round(Number(c));
    }
  }
  return null;
}

function readName(node) {
  if (!node || typeof node !== 'object') return '';
  const raw =
    node.name ?? node.title ?? node.header ?? node.label ?? node.productName ?? node.displayName;
  return typeof raw === 'string' ? raw.trim() : '';
}

function childNodes(node) {
  if (!node || typeof node !== 'object') return [];
  const keys = [
    'children',
    'subTiles',
    'subtiles',
    'tiles',
    'widgets',
    'items',
    'products',
    'rows',
    'breakdown',
  ];
  const out = [];
  for (const k of keys) {
    const v = node[k];
    if (Array.isArray(v)) out.push(...v);
  }
  if (Array.isArray(node.results)) out.push(...node.results);
  return out;
}

function findBruttosalgNode(payload) {
  function walk(node) {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = walk(item);
        if (found) return found;
      }
      return null;
    }
    if (isBruttosalgName(readName(node))) return node;
    for (const child of childNodes(node)) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  }
  return walk(payload);
}

function parseSalesysBruttosalgResults(payload) {
  const products = [];
  const bruttoNode = findBruttosalgNode(payload);
  let grossOrders = bruttoNode ? readOrderCount(bruttoNode) : null;

  if (bruttoNode) {
    const seen = new Set();
    for (const child of childNodes(bruttoNode)) {
      const childName = readName(child);
      const childCount = readOrderCount(child);
      if (!childName || isBruttosalgName(childName) || childCount === null) continue;
      const key = childName.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      products.push({ product: childName, orders: childCount });
    }
  }

  if (grossOrders === null && products.length > 0) {
    grossOrders = products.reduce((s, p) => s + p.orders, 0);
  }

  return {
    grossOrders: grossOrders ?? 0,
    products,
    foundBruttosalg: Boolean(findBruttosalgNode(payload)),
  };
}

function findBruttosalgNode(payload) {
  function walk(node) {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = walk(item);
        if (found) return found;
      }
      return null;
    }
    if (isBruttosalgName(readName(node))) return node;
    for (const child of childNodes(node)) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  }
  return walk(payload);
}

const fixturePath = path.join(__dirname, '../fixtures/salesys-bruttosalg-sample.json');
const sample = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const parsed = parseSalesysBruttosalgResults(sample);

assert.strictEqual(parsed.foundBruttosalg, true, 'found Bruttosalg');
assert.strictEqual(parsed.grossOrders, 7, 'gross Bruttosalg');
assert.strictEqual(parsed.products.length, 3, 'product breakdown count');
assert.deepStrictEqual(
  parsed.products.map((p) => p.product).sort(),
  ['Fastpris 12 mnd', 'Norgespris', 'Spotpris']
);

console.log('test-salesys-parser: OK');
console.log(JSON.stringify(parsed, null, 2));