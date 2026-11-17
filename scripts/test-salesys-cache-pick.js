/**
 * SaleSys cache pick — legacy poisoned zeros must be re-synced.
 * Run: node scripts/test-salesys-cache-pick.js
 */

const assert = require('assert');

const SALESYS_TRUSTED_CACHE_AFTER_MS = Date.parse('2026-11-17T09:30:00.000Z');
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const MAX_SALESYS_DAYS_PER_REQUEST = 8;

function isPoisonedLegacyZero(orders, fetchedAt) {
  if (orders === null || orders === undefined) return false;
  if (orders !== 0) return false;
  if (!fetchedAt) return true;
  const fetchedMs = Date.parse(fetchedAt);
  if (Number.isNaN(fetchedMs)) return true;
  return fetchedMs < SALESYS_TRUSTED_CACHE_AFTER_MS;
}

function isStale(fetchedAt, saleDate, nowMs) {
  if (!fetchedAt) return true;
  const age = nowMs - Date.parse(fetchedAt);
  if (age < CACHE_MAX_AGE_MS) return false;
  const today = '2026-11-17';
  const yesterday = '2026-11-16';
  return saleDate === today || saleDate === yesterday;
}

function cacheNeedsRefresh(fetchedAt, saleDate, orders, nowMs) {
  if (!fetchedAt) return true;
  if (isPoisonedLegacyZero(orders, fetchedAt)) return true;
  return isStale(fetchedAt, saleDate, nowMs);
}

assert.strictEqual(
  isPoisonedLegacyZero(0, '2026-11-17T08:00:00.000Z'),
  true,
  'pre-fix zero'
);
assert.strictEqual(
  isPoisonedLegacyZero(0, '2026-11-17T12:00:00.000Z'),
  false,
  'post-fix zero is trusted'
);
assert.strictEqual(isPoisonedLegacyZero(5, '2026-11-17T08:00:00.000Z'), false);

const nowMs = Date.parse('2026-11-17T12:00:00.000Z');
assert.strictEqual(
  cacheNeedsRefresh('2026-11-17T08:00:00.000Z', '2026-11-10', 0, nowMs),
  true
);
assert.strictEqual(
  cacheNeedsRefresh('2026-11-17T12:00:00.000Z', '2026-11-10', 0, nowMs),
  false
);

assert.strictEqual(MAX_SALESYS_DAYS_PER_REQUEST, 8);

console.log('test-salesys-cache-pick: OK');