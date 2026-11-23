/** Routes where first-party lead/signup forms may appear (TrustedForm script scope). */
const LEAD_FORM_PATHS = new Set([
  '/',
  '/start-her',
  '/starta-har',
  '/sammenlign-strompriser',
  '/kontakt',
  '/jamfor-elpriser',
  '/analyser-faktura',
  '/affiliate',
  '/partner',
]);

export function isLeadFormPage(pathname: string): boolean {
  return LEAD_FORM_PATHS.has(pathname);
}