export const API_URL = "https://perfect-bravery-production-5ce7.up.railway.app";

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string | null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}