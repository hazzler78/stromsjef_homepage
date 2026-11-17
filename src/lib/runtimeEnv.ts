import { getRequestContext } from '@cloudflare/next-on-pages';

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"|"$/g, '');
}

/**
 * Read env vars in Cloudflare Pages (bindings on request context) and locally (process.env).
 * Pages secrets often are not on process.env at Worker runtime.
 */
export function readRuntimeEnv(key: string): string | undefined {
  const fromProcess = sanitizeEnv(process.env[key]);
  if (fromProcess) return fromProcess;

  try {
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Record<string, string | undefined>;
    return sanitizeEnv(env[key]);
  } catch {
    return undefined;
  }
}