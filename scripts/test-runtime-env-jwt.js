/**
 * Supabase API key classification (no secrets in repo).
 * Run: npm run test:runtime-env-jwt
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

function classifySupabaseApiKey(key) {
  if (!key) return 'unknown';
  if (key.startsWith('sb_secret_')) return 'secret_key';
  if (key.startsWith('sb_publishable_')) return 'publishable';
  const jwtRole = supabaseJwtRole(key);
  if (jwtRole === 'service_role' || jwtRole === 'anon') return jwtRole;
  return 'unknown';
}

function isSupabaseServerKey(key) {
  const kind = classifySupabaseApiKey(key);
  return kind === 'service_role' || kind === 'secret_key';
}

const serviceHeader = Buffer.from(JSON.stringify({ role: 'service_role' })).toString(
  'base64url'
);
const anonHeader = Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url');
const serviceJwt = `aaa.${serviceHeader}.bbb`;
const anonJwt = `aaa.${anonHeader}.bbb`;

assert.strictEqual(supabaseJwtRole(serviceJwt), 'service_role');
assert.strictEqual(supabaseJwtRole(anonJwt), 'anon');
assert.strictEqual(classifySupabaseApiKey(serviceJwt), 'service_role');
assert.strictEqual(classifySupabaseApiKey(anonJwt), 'anon');
assert.strictEqual(classifySupabaseApiKey('sb_secret_abc123_checksum'), 'secret_key');
assert.strictEqual(
  classifySupabaseApiKey('sb_publishable_abc123_checksum'),
  'publishable'
);
assert.strictEqual(classifySupabaseApiKey('not-a-key'), 'unknown');

assert.strictEqual(isSupabaseServerKey(serviceJwt), true);
assert.strictEqual(isSupabaseServerKey('sb_secret_abc123_checksum'), true);
assert.strictEqual(isSupabaseServerKey(anonJwt), false);
assert.strictEqual(
  isSupabaseServerKey('sb_publishable_abc123_checksum'),
  false
);

console.log('test-runtime-env-jwt: OK');