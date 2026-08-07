const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type FetchOpts = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T = any>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

// --- Token storage helpers (demo-grade: localStorage). ---
// For production, prefer httpOnly cookies set by the backend to reduce XSS risk.
export function getCustomerToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bank_access_token");
}
export function setCustomerToken(token: string) {
  localStorage.setItem("bank_access_token", token);
}
export function clearCustomerToken() {
  localStorage.removeItem("bank_access_token");
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bank_admin_token");
}
export function setAdminToken(token: string) {
  localStorage.setItem("bank_admin_token", token);
}
export function clearAdminToken() {
  localStorage.removeItem("bank_admin_token");
}
