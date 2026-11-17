import { DeviceEventEmitter } from 'react-native';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

if (!API_URL) {
  console.warn("A variável de ambiente API_URL não está definida.");
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Blindagem 1: Timeout de 15 segundos para não travar o app se a internet cair
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal as any,
    });
    clearTimeout(timeoutId);

    // Blindagem 2: Se o token for inválido ou expirar (401), avisa o AuthContext para deslogar
    if (response.status === 401) {
      DeviceEventEmitter.emit('saspi_unauthorized');
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("O servidor demorou muito para responder. Verifique sua conexão.");
    }
    throw error;
  }
}