const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
export const apiEnabled = Boolean(configuredBaseUrl);
const baseUrl = configuredBaseUrl?.replace(/\/$/, '') ?? '';
let csrfRequest: Promise<void> | undefined;

function csrfCookie() {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
    ?.split('=').slice(1).join('=');
}

async function ensureCsrfToken() {
  if (csrfCookie()) return;
  csrfRequest ??= fetch(`${baseUrl}/auth/csrf`, { credentials: 'include' })
    .then(async (response) => {
      if (!response.ok) throw new Error('Could not initialize request security.');
    })
    .finally(() => {
      csrfRequest = undefined;
    });
  await csrfRequest;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (mutating) await ensureCsrfToken();

  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = csrfCookie();
  if (mutating && token) headers.set('X-XSRF-TOKEN', decodeURIComponent(token));

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  if (response.status === 401) {
    window.dispatchEvent(new Event('portfolio:unauthorized'));
  }
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => null)) as T | { message?: string } | null;
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body ? body.message : undefined;
    throw new Error(message || `API request failed with status ${response.status}.`);
  }
  return body as T;
}

export function apiPath(path: string) {
  return encodeURIComponent(path);
}

