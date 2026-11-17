/**
 * Supabase JWT role helper sanity check (no secrets in repo).
 * Run: node scripts/test-runtime-env-jwt.js
 */

const assert = require('assert');

function supabaseJwtRole(key) {
  const parts = key.split('.');
  if (parts.length < 2) return 'unknown';
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(json);
    if (payload.role === 'service_role') return 'service_role';
    if (payload.role === 'anon') return 'anon';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

const serviceHeader = Buffer.from(JSON.stringify({ role: 'service_role' })).toString(
  'base64url'
);
const anonHeader = Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url');
assert.strictEqual(supabaseJwtRole(`aaa.${serviceHeader}.bbb`), 'service_role');
assert.strictEqual(supabaseJwtRole(`aaa.${anonHeader}.bbb`), 'anon');

console.log('test-runtime-env-jwt: OK');