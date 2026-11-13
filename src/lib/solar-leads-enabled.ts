/**
 * Feature flag for Otovo / solar lead collection on stromsjef.no (default OFF).
 *
 * Re-enable: set `NEXT_PUBLIC_SOLAR_LEADS_ENABLED=true` in the deployment env
 * (Cloudflare Pages / preview). Optionally set `SOLAR_LEADS_ENABLED=true` for
 * server-only overrides; the API accepts either variable as ON.
 */

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

function parseEnvFlag(value: string | undefined): boolean {
  if (value == null || value === '') return false;
  return TRUTHY.has(value.trim().toLowerCase());
}

/** Server-side (API routes, RSC). Checks public + server env vars. */
export function isSolarLeadsEnabled(): boolean {
  return (
    parseEnvFlag(process.env.NEXT_PUBLIC_SOLAR_LEADS_ENABLED) ||
    parseEnvFlag(process.env.SOLAR_LEADS_ENABLED)
  );
}

/**
 * Client bundles only inline `NEXT_PUBLIC_*` at build time.
 * Use in client components; keep in sync with server via the same public var.
 */
export function isSolarLeadsEnabledClient(): boolean {
  return parseEnvFlag(process.env.NEXT_PUBLIC_SOLAR_LEADS_ENABLED);
}
