const SALESYS_WEB_FORM_SRC = 'https://salesys.se/scripts/web_form1.js';
const SCRIPT_SELECTOR = 'script[data-salesys-web-form="1"]';

let loadPromise: Promise<void> | null = null;

/** Load salesys.se/web_form1.js once per page (shared across form mounts). */
export function loadSalesysWebFormScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('no window'));
  }
  if (typeof window.createWebForm === 'function') {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const finishOk = () => {
      if (typeof window.createWebForm === 'function') resolve();
      else reject(new Error('createWebForm missing after script load'));
    };

    const existing = document.querySelector(SCRIPT_SELECTOR) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === '1') {
        finishOk();
        return;
      }
      existing.addEventListener('load', () => finishOk(), { once: true });
      existing.addEventListener('error', () => reject(new Error('script error')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SALESYS_WEB_FORM_SRC;
    script.async = true;
    script.dataset.salesysWebForm = '1';
    script.onload = () => {
      script.dataset.loaded = '1';
      finishOk();
    };
    script.onerror = () => reject(new Error('script error'));
    document.body.appendChild(script);
  }).catch((err) => {
    loadPromise = null;
    throw err;
  });

  return loadPromise;
}