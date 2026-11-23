/** Open the in-app cookie preferences panel (listened by CookieConsent). */
export const OPEN_COOKIE_SETTINGS_EVENT = 'stromsjef-open-cookie-settings';

export function openCookieSettings(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}