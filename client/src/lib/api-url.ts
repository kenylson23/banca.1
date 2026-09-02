const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

export const API_BASE_URL = configuredApiUrl?.replace(/\/+$/, "") ?? "";

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (typeof input === "string") {
    return fetch(buildApiUrl(input), init);
  }

  if (input instanceof URL) {
    return fetch(buildApiUrl(input.toString()), init);
  }

  if (input instanceof Request) {
    return fetch(buildApiUrl(input.url), init);
  }

  return fetch(input, init);
}

export function buildWebSocketUrl(path = "/ws"): string {
  const base = API_BASE_URL || window.location.origin;
  const url = new URL(path, base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}