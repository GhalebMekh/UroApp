/**
 * Single place that knows where the backend lives.
 *
 * In dev, VITE_API_BASE is unset and requests stay relative so Vite's
 * `server.proxy` forwards /api to localhost:3002. In production the web app is
 * a static site with no proxy, so VITE_API_BASE must point at the backend
 * origin (e.g. https://uroapp-backend.onrender.com) or every /api request is
 * answered by the static host with HTML.
 */
/** Used by production builds when VITE_API_BASE isn't set on the host. */
const DEFAULT_PROD_API = 'https://uroapp-backend.onrender.com';

function resolveBase() {
  const configured = import.meta.env.VITE_API_BASE;
  // "/" is the escape hatch for hosts that rewrite /api to the backend themselves.
  if (configured === '/') return '';
  if (configured) return configured.replace(/\/$/, '');
  // import.meta.env.DEV is true only under `vite dev`, where the proxy applies.
  return import.meta.env.DEV ? '' : DEFAULT_PROD_API;
}

const API_BASE = resolveBase();

/** Shown when the response body isn't JSON — almost always a misrouted /api call. */
const UNREACHABLE =
  "Can't reach the UroApp server. If this persists, the app's API address needs configuring.";

export async function apiFetch(path, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    console.error(`Network error calling ${API_BASE}${path}`, e);
    throw new Error("Can't reach the UroApp server. Check your connection and try again.");
  }

  // Read as text first: a static host answering /api returns HTML, and calling
  // res.json() on that throws an opaque parser error instead of a usable one.
  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error(
      `Expected JSON from ${API_BASE}${path} but got ${res.status} ${res.headers.get('content-type')}:`,
      raw.slice(0, 200),
    );
    throw new Error(UNREACHABLE);
  }

  if (!res.ok || data.error) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
