/**
 * Base API client.
 *
 * All service modules call through here.
 *
 * To switch from mock to a real FastAPI backend, change BASE_URL and flip
 * USE_MOCK to false. No React component needs to change.
 */

export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false"; // default: mock mode

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/** Convenience wrappers */
export const get = <T>(path: string) => apiRequest<T>("GET", path);
export const post = <T>(path: string, body?: unknown) => apiRequest<T>("POST", path, body);
export const patch = <T>(path: string, body?: unknown) => apiRequest<T>("PATCH", path, body);
export const del = <T>(path: string) => apiRequest<T>("DELETE", path);
