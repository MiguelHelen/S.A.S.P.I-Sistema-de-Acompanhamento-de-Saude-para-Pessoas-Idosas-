import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../api/client";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  clinica_id?: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarSessao() {
      try {
        const storedToken = await AsyncStorage.getItem("saspi_token");
        const storedUser = await AsyncStorage.getItem("saspi_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Erro ao ler sessão local:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarSessao();
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

      if (!res.ok) {
        return { ok: false, message: data.message || "E-mail ou senha inválidos." };
      }

      const accessToken = data.access_token || data.token;
      let userData = data.usuario || data.user;

      if (accessToken && (!userData?.nome || !userData?.perfil)) {
        try {
          const userRes = await fetch(`${API_URL}/usuario?email=${encodeURIComponent(emailLower)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (userRes.ok) {
            const list = await userRes.json();
            const encontrado = Array.isArray(list) ? list.find((u: any) => u.email?.toLowerCase() === emailLower) : list;
            if (encontrado) userData = encontrado;
          }
        } catch {}
      }

      const usuarioFinal: Usuario = {
        id: userData?.id || "",
        nome: userData?.nome || emailLower.split("@")[0],
        email: emailLower,
        perfil: (userData?.perfil || "FAMILIAR").toUpperCase(),
        clinica_id: userData?.clinica_id,
      };

      await AsyncStorage.setItem("saspi_token", accessToken);
      await AsyncStorage.setItem("saspi_user", JSON.stringify(usuarioFinal));

      setToken(accessToken);
      setUsuario(usuarioFinal);

      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err.message || "Erro de conexão com o servidor." };
    }
  }

  async function logout() {
    await AsyncStorage.removeItem("saspi_token");
    await AsyncStorage.removeItem("saspi_user");
    await AsyncStorage.removeItem("saspi_active_elderly");
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}