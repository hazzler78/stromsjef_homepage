/** Password entered at admin login; sent to protected /api/admin/* routes. */
export function getStoredAdminPassword(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('admin_password');
}

export function storeAdminPassword(password: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('admin_password', password);
}

/** True when the browser session can call protected /api/admin/* routes. */
export function isAdminBrowserSessionReady(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    sessionStorage.getItem('admin_authed') === 'true' &&
    Boolean(getStoredAdminPassword())
  );
}

export function clearAdminBrowserSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('admin_authed');
  sessionStorage.removeItem('admin_password');
}

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const password = getStoredAdminPassword();
  const headers = new Headers(init?.headers);
  if (password) {
    headers.set('x-admin-password', password);
  }
  return fetch(input, { ...init, headers });
}