import {
  getOptionalRequestContext,
  getRequestContext,
} from '@cloudflare/next-on-pages';

export type EnvSource = 'context' | 'process' | 'none';

export type SupabaseKeyKind =
  | 'service_role'
  | 'secret_key'
  | 'anon'
  | 'publishable'
  | 'unknown';

export type EnvProbe = {
  hasValue: boolean;
  source: EnvSource;
  /** For Supabase API keys only — never expose the secret itself. */
  jwtRole?: SupabaseKeyKind;
};

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"|"$/g, '');
}


/** Decode role claim from a legacy Supabase JWT (no verification — diagnostics only). */
export function supabaseJwtRole(key: string | undefined): EnvProbe['jwtRole'] {
  if (!key) return 'unknown';
  const parts = key.split('.');
  if (parts.length < 2) return 'unknown';
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(json) as { role?: string };
    if (payload.role === 'service_role') return 'service_role';
    if (payload.role === 'anon') return 'anon';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/** Classify Supabase API keys (legacy JWT + new `sb_*` formats). */
export function classifySupabaseApiKey(
  key: string | undefined
): SupabaseKeyKind {
  if (!key) return 'unknown';
  if (key.startsWith('sb_secret_')) return 'secret_key';
  if (key.startsWith('sb_publishable_')) return 'publishable';
  const jwtRole = supabaseJwtRole(key);
  if (jwtRole === 'service_role' || jwtRole === 'anon') return jwtRole;
  return 'unknown';
}

/** Elevated server keys acceptable for admin/worker clients. */
export function isSupabaseServerKey(key: string): boolean {
  const kind = classifySupabaseApiKey(key);
  return kind === 'service_role' || kind === 'secret_key';
}

function readFromProcess(key: string): string | undefined {
  return sanitizeEnv(process.env[key]);
}

function readFromContext(key: string): string | undefined {
  const ctx = getOptionalRequestContext();
  if (!ctx?.env) return undefined;
  return sanitizeEnv((ctx.env as Record<string, string | undefined>)[key]);
}

function probeRuntimeEnvFrom(key: string, from: 'context' | 'process'): EnvProbe {
  const value = from === 'context' ? readFromContext(key) : readFromProcess(key);
  const probe: EnvProbe = {
    hasValue: Boolean(value),
    source: value ? from : 'none',
  };
  if (key.includes('SUPABASE') && key.includes('KEY')) {
    probe.jwtRole = classifySupabaseApiKey(value);
  }
  return probe;
}

export function probeRuntimeEnv(key: string): EnvProbe {
  const fromContext = readFromContext(key);
  const fromProcess = readFromProcess(key);
  const value = fromContext ?? fromProcess;
  const source: EnvSource = fromContext
    ? 'context'
    : fromProcess
      ? 'process'
      : 'none';
  const probe: EnvProbe = { hasValue: Boolean(value), source };
  if (key.includes('SUPABASE') && key.includes('KEY')) {
    probe.jwtRole = classifySupabaseApiKey(value);
  }
  return probe;
}

/**
 * Prefer Cloudflare request `env` (runtime Pages bindings) over `process.env`.
 * On next-on-pages, `process.env` can reflect build-time values; secrets and
 * production-only vars are authoritative on `getRequestContext().env`.
 */
export function readRuntimeEnv(key: string): string | undefined {
  return readFromContext(key) ?? readFromProcess(key);
}

/**
 * Pick the Supabase service-role key when both context and process provide a value.
 */
export function readSupabaseServiceRoleKey(): string | undefined {
  const contextKey = readFromContext('SUPABASE_SERVICE_ROLE_KEY');
  const processKey = readFromProcess('SUPABASE_SERVICE_ROLE_KEY');

  const candidates = [
    { key: contextKey, source: 'context' as const },
    { key: processKey, source: 'process' as const },
  ].filter((c) => c.key);

  for (const c of candidates) {
    const key = c.key;
    if (key && isSupabaseServerKey(key)) return key;
  }
  // Never fall back to anon/publishable/build-time keys.
  return undefined;
}

export function readSupabaseUrl(): string | undefined {
  return (
    readFromContext('SUPABASE_URL') ??
    readFromProcess('SUPABASE_URL') ??
    readFromContext('NEXT_PUBLIC_SUPABASE_URL') ??
    readFromProcess('NEXT_PUBLIC_SUPABASE_URL')
  );
}

/** Safe diagnostics object for admin responses (booleans + sources only). */
export function buildEnvDiagnostics(): Record<string, unknown> {
  const cfToken = probeRuntimeEnv('CF_ANALYTICS_API_TOKEN');
  const cfZone = probeRuntimeEnv('CF_ZONE_ID');
  const serviceKeyContext = probeRuntimeEnvFrom('SUPABASE_SERVICE_ROLE_KEY', 'context');
  const serviceKeyProcess = probeRuntimeEnvFrom('SUPABASE_SERVICE_ROLE_KEY', 'process');
  const serviceKey = probeRuntimeEnv('SUPABASE_SERVICE_ROLE_KEY');
  const salesysLink = probeRuntimeEnv('SALESYS_DASHBOARD_LINK_ID');

  let cloudflareContextAvailable = false;
  try {
    getRequestContext();
    cloudflareContextAvailable = true;
  } catch {
    cloudflareContextAvailable = false;
  }

  return {
    cloudflareContextAvailable,
    hasCfToken: cfToken.hasValue,
    cfTokenSource: cfToken.source,
    hasZoneId: cfZone.hasValue,
    zoneIdSource: cfZone.source,
    hasServiceKey: serviceKey.hasValue,
    serviceKeySource: serviceKey.source,
    supabaseKeyRole: serviceKey.jwtRole ?? 'missing',
    serviceKeyRoleContext: serviceKeyContext.jwtRole ?? 'missing',
    serviceKeyRoleProcess: serviceKeyProcess.jwtRole ?? 'missing',
    hasSalesysLinkId: salesysLink.hasValue,
    salesysLinkIdSource: salesysLink.source,
  };
}