import * as SecureStore from "expo-secure-store";
import { API_URL } from "./client";

export async function uploadFotoPerfilUsuario(
  usuarioId: string,
  imageUri: string
): Promise<{ ok: boolean; url?: string; message?: string }> {
  try {
    const token = await SecureStore.getItemAsync("saspi_secure_token");
    if (!token) {
      return { ok: false, message: "Sessão expirada. Faça login novamente." };
    }

    const fileName = imageUri.split("/").pop() || `avatar-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(fileName);
    const ext = match ? match[1].toLowerCase() : "jpg";
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await fetch(`${API_URL}/storage/usuario/${usuarioId}/foto-perfil`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        message: data?.message || "Não foi possível enviar a foto de perfil.",
      };
    }

    return { ok: true, url: data.url };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message || "Erro de conexão ao enviar a imagem.",
    };
  }
}