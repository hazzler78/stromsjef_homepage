/** Norwegian lead form validation (phone, postnummer, address). */

export function normalizeNorwegianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  let national = digits;
  if (national.startsWith('47') && national.length >= 10) {
    national = national.slice(2);
  }
  if (national.length !== 8) return null;
  if (!/^[49]/.test(national)) return null;
  return national;
}

export function formatNorwegianPhoneDisplay(national8: string): string {
  return `+47 ${national8.slice(0, 3)} ${national8.slice(3, 5)} ${national8.slice(5)}`;
}

export function isValidNorwegianPostalCode(raw: string): boolean {
  const code = raw.replace(/\s+/g, '');
  if (!/^\d{4}$/.test(code)) return false;
  const n = parseInt(code, 10);
  return n >= 1 && n <= 9999;
}

export function isValidNorwegianStreetAddress(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed.length < 3) return false;
  if (!/[a-zA-ZæøåÆØÅ]/.test(trimmed)) return false;
  return true;
}

export function isValidNorwegianPoststed(raw: string): boolean {
  const trimmed = raw.trim();
  return trimmed.length >= 2 && /[a-zA-ZæøåÆØÅ]/.test(trimmed);
}
