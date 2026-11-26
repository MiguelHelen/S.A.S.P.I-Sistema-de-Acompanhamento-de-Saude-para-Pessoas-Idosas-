import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { DeviceEventEmitter, Alert } from "react-native";
import { API_URL } from "../api/client";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  clinica_id?: string;
  nomeClinica?: string;
  foto_url?: string | null;
}

export interface IdosoAtivo {
  id: string;
  nome: string;
  data_nascimento?: string;
  sexo?: string;
  foto_url?: string | null;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  idosoAtivo: IdosoAtivo | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ ok: boolean; message?: string }>;
  loginSSO: (
    providerToken: string,
    provider: "GOOGLE" | "MICROSOFT"
  ) => Promise<{ ok: boolean; message?: string }>;
  selecionarIdoso: (idoso: IdosoAtivo) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function decodificarJwt(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    for (let bc = 0, bs = 0, buffer, idx = 0; (buffer = padded.charAt(idx++)); ) {
      const pos = chars.indexOf(buffer);
      if (pos === -1) continue;
      bs = bc % 4 ? bs * 64 + pos : pos;
      if (bc++ % 4) output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
    }
    return JSON.parse(decodeURIComponent(escape(output)));
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [idosoAtivo, setIdosoAtivo] = useState<IdosoAtivo | null>(null);
  const [loading, setLoading] = useState(true);
  const deslogandoRef = useRef(false);

  useEffect(() => {
    async function carregarSessao() {
      try {
        const [storedToken, storedUser, storedElderly] = await Promise.all([
          SecureStore.getItemAsync("saspi_secure_token"),
          AsyncStorage.getItem("saspi_user"),
          AsyncStorage.getItem("saspi_active_elderly"),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUser));
        }
        if (storedElderly) {
          setIdosoAtivo(JSON.parse(storedElderly));
        }
      } catch (err) {
        console.error("Erro ao ler sessão criptografada:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarSessao();

    const subUnauthorized = DeviceEventEmitter.addListener("saspi_unauthorized", () => {
      if (deslogandoRef.current) return;
      deslogandoRef.current = true;
      Alert.alert("Sessão Expirada", "Por segurança, faça login novamente.");
      logout().finally(() => {
        deslogandoRef.current = false;
      });
    });

    const subElderlyChanged = DeviceEventEmitter.addListener("saspi_elderly_changed", async () => {
      try {
        const stored = await AsyncStorage.getItem("saspi_active_elderly");
        setIdosoAtivo(stored ? JSON.parse(stored) : null);
      } catch {}
    });

    return () => {
      subUnauthorized.remove();
      subElderlyChanged.remove();
    };
  }, []);

  async function selecionarIdoso(idoso: IdosoAtivo) {
    setIdosoAtivo(idoso);
    await AsyncStorage.setItem("saspi_active_elderly", JSON.stringify(idoso));
    DeviceEventEmitter.emit("saspi_elderly_changed");
  }

  async function login(email: string, senha: string) {
    try {
      const emailLower = email.trim().toLowerCase();
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLower, senha }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.message || "E-mail ou senha inválidos." };
      }

      return await processarAutenticacao(data, emailLower);
    } catch {
      return { ok: false, message: "Falha na rede. O servidor pode estar indisponível." };
    }
  }

  async function loginSSO(providerToken: string, provider: "GOOGLE" | "MICROSOFT") {
    try {
      const res = await fetch(`${API_URL}/auth/sso-callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: providerToken, provedor: provider }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.message || "Falha na autenticação corporativa." };
      }

      return await processarAutenticacao(data, data.usuario?.email || data.user?.email || "");
    } catch {
      return { ok: false, message: "Erro de conexão com o servidor SSO." };
    }
  }

  async function processarAutenticacao(data: any, emailBuscado: string) {
    const accessToken = data.access_token || data.token;
    const jwtPayload = accessToken ? decodificarJwt(accessToken) : null;
    let userData: any = data.usuario || data.user || {};

    const userId = userData.id || jwtPayload?.sub || jwtPayload?.id || "";

    if (accessToken && userId && (!userData.nome || !userData.perfil)) {
      try {
        const resById = await fetch(`${API_URL}/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (resById.ok) {
          const found = await resById.json();
          if (found?.id) userData = { ...userData, ...found };
        }
      } catch {}
    }

    if (accessToken && (!userData.nome || !userData.perfil) && emailBuscado) {
      try {
        const userRes = await fetch(
          `${API_URL}/usuario?email=${encodeURIComponent(emailBuscado)}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (userRes.ok) {
          const list = await userRes.json();
          const encontrado = Array.isArray(list)
            ? list.find((u: any) => u.email?.toLowerCase() === emailBuscado)
            : list;
          if (encontrado) userData = { ...userData, ...encontrado };
        }
      } catch {}
    }

    const perfil = String(
      userData.perfil || jwtPayload?.perfil || jwtPayload?.role || "FAMILIAR"
    ).toUpperCase();

    if (
      perfil === "MEDICO" ||
      perfil === "ADMINISTRADOR" ||
      perfil === "ENFERMEIRO" ||
      perfil === "ADMIN"
    ) {
      return {
        ok: false,
        message: `Acesso negado. O perfil ${perfil} deve utilizar a plataforma Web.`,
      };
    }

    const clinicaId = userData.clinica_id || jwtPayload?.clinica_id;
    let nomeClinicaBanco: string | undefined = userData.clinica?.nome;
    if (accessToken && clinicaId && !nomeClinicaBanco) {
      try {
        const clinicaRes = await fetch(`${API_URL}/clinica/${clinicaId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (clinicaRes.ok) {
          const clinicaData = await clinicaRes.json();
          nomeClinicaBanco = clinicaData?.nome;
        }
      } catch {}
    }

    const emailFinal = userData.email || emailBuscado || jwtPayload?.email || "";

    const usuarioFinal: Usuario = {
      id: userId,
      nome: userData.nome || jwtPayload?.nome || emailFinal.split("@")[0] || "Usuário",
      email: emailFinal,
      perfil,
      clinica_id: clinicaId,
      nomeClinica: nomeClinicaBanco,
      foto_url: userData.foto_url || null,
    };

    await SecureStore.setItemAsync("saspi_secure_token", accessToken);
    await AsyncStorage.setItem("saspi_user", JSON.stringify(usuarioFinal));

    setToken(accessToken);
    setUsuario(usuarioFinal);
    return { ok: true };
  }

  async function logout() {
    await SecureStore.deleteItemAsync("saspi_secure_token");
    await AsyncStorage.multiRemove(["saspi_user", "saspi_active_elderly"]);
    setToken(null);
    setUsuario(null);
    setIdosoAtivo(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        idosoAtivo,
        loading,
        login,
        loginSSO,
        selecionarIdoso,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}