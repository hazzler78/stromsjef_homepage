export const TRUSTED_FORM_FIELD_NAME = 'xxTrustedFormCertUrl';

let loadRequested = false;

/** Load ActiveProspect TrustedForm Certify (same params as account snippet). */
export function initTrustedFormScript(): void {
  if (typeof document === 'undefined' || loadRequested) return;
  loadRequested = true;

  const tf = document.createElement('script');
  tf.type = 'text/javascript';
  tf.async = true;
  tf.src =
    `https://api.trustedform.com/trustedform.js?field=${TRUSTED_FORM_FIELD_NAME}` +
    '&use_tagged_consent=true&l=' +
    new Date().getTime() +
    Math.random();
  const first = document.getElementsByTagName('script')[0];
  if (first?.parentNode) {
    first.parentNode.insertBefore(tf, first);
  } else {
    document.head.appendChild(tf);
  }
}

/** Read certificate URL injected by TrustedForm (may be empty until script has run). */
export function getTrustedFormCertUrl(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const input = document.querySelector<HTMLInputElement>(
    `input[name="${TRUSTED_FORM_FIELD_NAME}"]`
  );
  const value = input?.value?.trim();
  if (value?.startsWith('https://cert.trustedform.com/')) return value;
  return undefined;
}

export function trustedFormStorageSuffix(certUrl: string | undefined | null): string | null {
  if (!certUrl?.startsWith('https://cert.trustedform.com/')) return null;
  return `[TrustedForm] ${certUrl}`;
}

export function appendTrustedFormToMessage(
  message: string | null | undefined,
  certUrl: string | undefined | null
): string | null {
  const suffix = trustedFormStorageSuffix(certUrl);
  if (!suffix) return message?.trim() || null;
  const base = message?.trim();
  return base ? `${base}\n\n${suffix}` : suffix;
}