import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { DeviceEventEmitter, Alert } from "react-native";
import { API_URL } from "../api/client";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  clinica_id?: string;
  nomeClinica?: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ ok: boolean; message?: string }>;
  loginSSO: (
    providerToken: string,
    provider: "GOOGLE" | "MICROSOFT"
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const deslogandoRef = useRef(false);

  useEffect(() => {
    async function carregarSessao() {
      try {
        const storedToken = await SecureStore.getItemAsync("saspi_secure_token");
        const storedUser = await AsyncStorage.getItem("saspi_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Erro ao ler sessão criptografada:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarSessao();

    const sub = DeviceEventEmitter.addListener("saspi_unauthorized", () => {
      if (deslogandoRef.current) return;
      deslogandoRef.current = true;
      Alert.alert("Sessão Expirada", "Por segurança, faça login novamente.");
      logout().finally(() => {
        deslogandoRef.current = false;
      });
    });

    return () => sub.remove();
  }, []);

  async function login(email: string, senha: string) {
    try {
      const emailLower = email.trim().toLowerCase();
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLower, senha }),
      });

      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message || "E-mail ou senha inválidos." };

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

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.message || "Falha na autenticação corporativa." };
      }

      return await processarAutenticacao(data, data.usuario?.email || data.user?.email);
    } catch {
      return { ok: false, message: "Erro de conexão com o servidor SSO." };
    }
  }

  async function processarAutenticacao(data: any, emailBuscado: string) {
    const accessToken = data.access_token || data.token;
    let userData = data.usuario || data.user;

    if (accessToken && (!userData?.nome || !userData?.perfil || !userData?.clinica_id)) {
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
          if (encontrado) userData = encontrado;
        }
      } catch {}
    }

    const perfil = (userData?.perfil || "FAMILIAR").toUpperCase();

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

    // Busca o nome real da clínica no banco de dados
    let nomeClinicaBanco: string | undefined = userData?.clinica?.nome;
    if (accessToken && userData?.clinica_id && !nomeClinicaBanco) {
      try {
        const clinicaRes = await fetch(`${API_URL}/clinica/${userData.clinica_id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (clinicaRes.ok) {
          const clinicaData = await clinicaRes.json();
          nomeClinicaBanco = clinicaData?.nome;
        }
      } catch {}
    }

    const usuarioFinal: Usuario = {
      id: userData?.id || "",
      nome: userData?.nome || emailBuscado.split("@")[0],
      email: emailBuscado,
      perfil: perfil,
      clinica_id: userData?.clinica_id,
      nomeClinica: nomeClinicaBanco,
    };

    await SecureStore.setItemAsync("saspi_secure_token", accessToken);
    await AsyncStorage.setItem("saspi_user", JSON.stringify(usuarioFinal));

    setToken(accessToken);
    setUsuario(usuarioFinal);
    return { ok: true };
  }

  async function logout() {
    await SecureStore.deleteItemAsync("saspi_secure_token");
    await AsyncStorage.removeItem("saspi_user");
    await AsyncStorage.removeItem("saspi_active_elderly");
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, loginSSO, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}