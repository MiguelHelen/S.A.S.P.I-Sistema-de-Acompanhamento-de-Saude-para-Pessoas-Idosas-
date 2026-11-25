export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

const COOKIE_MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  clinica_id: string;
  clinica_nome: string;
  cpf?: string;
  telefone?: string;
  especialidade?: string;
  registro_profissional?: string;
  foto_url?: string;
}

export function normalizarPerfil(perfil?: string | null): string {
  const p = String(perfil || "").trim().toUpperCase();
  if (p === "ADMIN") return "ADMINISTRADOR";
  return p;
}

export function isAdminPerfil(perfil?: string | null): boolean {
  const p = normalizarPerfil(perfil);
  return p === "ADMINISTRADOR";
}

export function isPerfilClinico(perfil?: string | null): boolean {
  const p = normalizarPerfil(perfil);
  return p === "MEDICO" || p === "ENFERMEIRO" || p === "CUIDADOR";
}

function lerCookie(nome: string): string | null {
  if (typeof document === "undefined") return null;
  const prefixo = `${nome}=`;
  const partes = document.cookie.split(";");
  for (const parte of partes) {
    const limpa = parte.trim();
    if (limpa.startsWith(prefixo)) {
      return limpa.substring(prefixo.length);
    }
  }
  return null;
}

function gravarCookieSessao(
  nome: string,
  valor: string,
  maxAgeSegundos = COOKIE_MAX_AGE_SEGUNDOS
) {
  if (typeof document === "undefined") return;
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const secure = isHttps ? "; Secure" : "";
  document.cookie = `${nome}=${encodeURIComponent(valor)}; path=/; max-age=${maxAgeSegundos}; SameSite=Lax${secure}`;
}

function removerCookieSessao(nome: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${nome}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `${nome}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
}

function serializarUsuarioCompactoCookie(usuario: {
  id?: string;
  perfil?: string;
  clinica_id?: string;
}): string {
  return JSON.stringify({
    id: String(usuario.id || ""),
    perfil: normalizarPerfil(usuario.perfil),
    clinica_id: String(usuario.clinica_id || ""),
  });
}

function decodificarPayloadJwt(token: string): Record<string, any> | null {
  try {
    const partes = token.split(".");
    if (partes.length < 2) return null;
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getTokenSessao(): string | null {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("saspi_token");

  if (!token) {
    const cookieToken = lerCookie("saspi_token");
    if (cookieToken) {
      try {
        token = decodeURIComponent(cookieToken);
      } catch {
        token = cookieToken;
      }
      if (token) {
        localStorage.setItem("saspi_token", token);
      }
    }
  }

  if (token && !lerCookie("saspi_token")) {
    gravarCookieSessao("saspi_token", token);
  }
  return token;
}

export function getUsuarioSessao(): UsuarioSessao | null {
  if (typeof window === "undefined") return null;
  let raw = localStorage.getItem("saspi_user");

  if (!raw) {
    const cookieUser = lerCookie("saspi_user");
    if (cookieUser) {
      try {
        raw = decodeURIComponent(cookieUser);
      } catch {
        raw = cookieUser;
      }
    }
  }

  const token = getTokenSessao();
  const jwtPayload = token ? decodificarPayloadJwt(token) : null;

  if (!raw && !jwtPayload) return null;

  try {
    const parsed = raw ? JSON.parse(raw) : {};
    const u = parsed?.user || parsed?.usuario || parsed || {};

    const idFinal = String(
      u.id || jwtPayload?.sub || jwtPayload?.id || ""
    ).trim();
    const emailFinal = String(u.email || jwtPayload?.email || "").trim();
    const perfilFinal = normalizarPerfil(
      u.perfil || u.role || jwtPayload?.perfil || jwtPayload?.role || ""
    );
    const clinicaId = String(
      u.clinica_id ||
        u.clinicaId ||
        u.clinica?.id ||
        jwtPayload?.clinica_id ||
        ""
    ).trim();
    const clinicaNome = String(
      u.clinica_nome || u.clinicaNome || u.clinica?.nome || ""
    ).trim();

    if (!idFinal && !emailFinal) return null;

    const sessao: UsuarioSessao = {
      id: idFinal,
      nome: String(u.nome || jwtPayload?.nome || ""),
      email: emailFinal,
      perfil: perfilFinal,
      clinica_id: clinicaId,
      clinica_nome: clinicaNome,
      cpf: u.cpf ? String(u.cpf) : undefined,
      telefone: u.telefone ? String(u.telefone) : undefined,
      especialidade: u.especialidade ? String(u.especialidade) : undefined,
      registro_profissional: u.registro_profissional
        ? String(u.registro_profissional)
        : undefined,
      foto_url: u.foto_url ? String(u.foto_url) : undefined,
    };

    if (!localStorage.getItem("saspi_user") && sessao.id) {
      localStorage.setItem("saspi_user", JSON.stringify(sessao));
    }

    if (sessao.id) {
      gravarCookieSessao("saspi_user", serializarUsuarioCompactoCookie(sessao));
    }

    return sessao;
  } catch {
    return null;
  }
}

export function getClinicaIdSessao(): string {
  return getUsuarioSessao()?.clinica_id || "";
}

export function getClinicaDados(): { id: string; nome: string } {
  const u = getUsuarioSessao();
  return {
    id: u?.clinica_id || "",
    nome: u?.clinica_nome || "",
  };
}

export function getAuthHeaders(
  json = false,
  tokenOverride?: string | null
): Record<string, string> {
  const token = tokenOverride !== undefined ? tokenOverride : getTokenSessao();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function getIdosoAtivoSessao<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("saspi_active_elderly");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function salvarUsuarioSessao(
  dados: Partial<UsuarioSessao> & Record<string, any>
): UsuarioSessao | null {
  if (typeof window === "undefined") return null;

  const atual = getUsuarioSessao();
  const origem = dados?.user || dados?.usuario || dados;

  const clinicaId = String(
    origem.clinica_id ||
      origem.clinicaId ||
      origem.clinica?.id ||
      atual?.clinica_id ||
      ""
  ).trim();

  const clinicaNome = String(
    origem.clinica_nome ||
      origem.clinicaNome ||
      origem.clinica?.nome ||
      atual?.clinica_nome ||
      ""
  ).trim();

  const perfilFinal = normalizarPerfil(
    origem.perfil || origem.role || atual?.perfil || ""
  );

  const normalizado: UsuarioSessao = {
    id: String(origem.id || atual?.id || ""),
    nome: String(origem.nome || atual?.nome || ""),
    email: String(origem.email || atual?.email || ""),
    perfil: perfilFinal,
    clinica_id: clinicaId,
    clinica_nome: clinicaNome,
    ...(origem.cpf !== undefined || atual?.cpf
      ? { cpf: String(origem.cpf ?? atual?.cpf ?? "") }
      : {}),
    ...(origem.telefone !== undefined || atual?.telefone
      ? { telefone: String(origem.telefone ?? atual?.telefone ?? "") }
      : {}),
    ...(origem.especialidade !== undefined || atual?.especialidade
      ? {
          especialidade: String(
            origem.especialidade ?? atual?.especialidade ?? ""
          ),
        }
      : {}),
    ...(origem.registro_profissional !== undefined ||
    atual?.registro_profissional
      ? {
          registro_profissional: String(
            origem.registro_profissional ?? atual?.registro_profissional ?? ""
          ),
        }
      : {}),
    ...(origem.foto_url !== undefined || atual?.foto_url
      ? { foto_url: String(origem.foto_url ?? atual?.foto_url ?? "") }
      : {}),
  };

  localStorage.setItem("saspi_user", JSON.stringify(normalizado));
  gravarCookieSessao("saspi_user", serializarUsuarioCompactoCookie(normalizado));

  const tokenAtual = localStorage.getItem("saspi_token");
  if (tokenAtual) {
    gravarCookieSessao("saspi_token", tokenAtual);
  }

  window.dispatchEvent(new Event("saspi_user_updated"));
  return normalizado;
}

export function limparSessao() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("saspi_token");
  localStorage.removeItem("saspi_user");
  localStorage.removeItem("saspi_active_elderly");
  localStorage.removeItem("saspi_elderly_list");

  removerCookieSessao("saspi_token");
  removerCookieSessao("saspi_user");

  window.dispatchEvent(new Event("saspi_user_updated"));
}

export function validarEObterClinicaId(usuario?: UsuarioSessao | null): string {
  const u = usuario ?? getUsuarioSessao();
  const id = String(u?.clinica_id || "").trim();
  if (!id) {
    throw new Error(
      "Sua sessão não está vinculada a nenhuma clínica. Faça login novamente."
    );
  }
  return id;
}

export async function buscarClinicaPorIdNoBackend(
  clinicaId: string,
  token?: string | null
): Promise<{ id: string; nome: string } | null> {
  const idLimpo = String(clinicaId || "").trim();
  if (!idLimpo) return null;

  try {
    const res = await fetch(`${API_URL}/clinica/${idLimpo}`, {
      headers: getAuthHeaders(false, token),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const clinica = data?.data || data;
    if (!clinica?.id) return null;

    return {
      id: String(clinica.id),
      nome: String(clinica.nome || ""),
    };
  } catch {
    return null;
  }
}

export async function resolverESalvarSessao(params: {
  token: string;
  usuarioParcial?: Record<string, any> | null;
  emailFallback?: string;
}): Promise<UsuarioSessao> {
  const { token, usuarioParcial, emailFallback } = params;

  localStorage.removeItem("saspi_active_elderly");
  localStorage.removeItem("saspi_elderly_list");
  localStorage.setItem("saspi_token", token);
  gravarCookieSessao("saspi_token", token);

  const jwtPayload = decodificarPayloadJwt(token) || {};

  let dadosUsuario: Record<string, any> = {
    ...jwtPayload,
    ...(usuarioParcial?.user || usuarioParcial?.usuario || usuarioParcial || {}),
  };

  if (!dadosUsuario.id && jwtPayload.sub) {
    dadosUsuario.id = jwtPayload.sub;
  }

  if (
    (!dadosUsuario.id ||
      !dadosUsuario.clinica_id ||
      !dadosUsuario.perfil ||
      !dadosUsuario.nome) &&
    token
  ) {
    try {
      if (dadosUsuario.id) {
        const resById = await fetch(`${API_URL}/usuario/${dadosUsuario.id}`, {
          headers: getAuthHeaders(false, token),
        });
        if (resById.ok) {
          const full = await resById.json();
          dadosUsuario = { ...dadosUsuario, ...(full?.data || full) };
        }
      }

      const emailBusca = String(
        dadosUsuario.email || emailFallback || ""
      ).trim();
      if ((!dadosUsuario.id || !dadosUsuario.nome) && emailBusca) {
        const resLista = await fetch(`${API_URL}/usuario`, {
          headers: getAuthHeaders(false, token),
        });
        if (resLista.ok) {
          const listaRaw = await resLista.json();
          const lista = Array.isArray(listaRaw)
            ? listaRaw
            : listaRaw?.data || [];
          const encontrado = lista.find(
            (item: any) =>
              String(item.email || "").toLowerCase() ===
              emailBusca.toLowerCase()
          );
          if (encontrado) {
            dadosUsuario = { ...dadosUsuario, ...encontrado };
          }
        }
      }
    } catch {}
  }

  const clinicaId = String(
    dadosUsuario.clinica_id ||
      dadosUsuario.clinicaId ||
      dadosUsuario.clinica?.id ||
      ""
  ).trim();

  let clinicaNome = String(
    dadosUsuario.clinica_nome ||
      dadosUsuario.clinicaNome ||
      dadosUsuario.clinica?.nome ||
      ""
  ).trim();

  if (clinicaId && !clinicaNome) {
    const clinicaBackend = await buscarClinicaPorIdNoBackend(clinicaId, token);
    if (clinicaBackend?.nome) {
      clinicaNome = clinicaBackend.nome;
    }
  }

  const sessaoSalva = salvarUsuarioSessao({
    ...dadosUsuario,
    email: dadosUsuario.email || emailFallback || "",
    clinica_id: clinicaId,
    clinica_nome: clinicaNome,
  });

  if (!sessaoSalva) {
    throw new Error("Falha ao registrar sessão do usuário.");
  }

  return sessaoSalva;
}