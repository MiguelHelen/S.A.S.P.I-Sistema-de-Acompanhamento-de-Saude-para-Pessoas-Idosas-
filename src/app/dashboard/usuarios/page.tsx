"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  isAdminPerfil,
  normalizarPerfil,
  validarEObterClinicaId,
} from "@/lib/clinica";
import {
  Users,
  Plus,
  Loader2,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Mail,
} from "lucide-react";

interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  telefone?: string;
  especialidade?: string;
  clinica_id?: string;
}

export default function UsuariosPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("TODOS");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [meuId, setMeuId] = useState("");

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const sessao = getUsuarioSessao();
    if (!sessao || !isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      setCarregando(false);
      return;
    }

    setAutorizado(true);
    setMeuId(sessao.id);

    try {
      const clinicaId = validarEObterClinicaId(sessao);

      const res = await fetch(`${API_URL}/usuario?clinica_id=${clinicaId}`, {
        headers: getAuthHeaders(false),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Não foi possível carregar os usuários da clínica."
        );
      }

      const raw = await res.json();
      const lista = Array.isArray(raw) ? raw : raw?.data || [];

      const filtradosClinica: UsuarioItem[] = lista
        .filter((u: any) => !u.clinica_id || u.clinica_id === clinicaId)
        .map((u: any) => ({
          id: String(u.id),
          nome: String(u.nome || ""),
          email: String(u.email || ""),
          perfil: normalizarPerfil(u.perfil || u.role),
          telefone: u.telefone || undefined,
          especialidade: u.especialidade || undefined,
          clinica_id: u.clinica_id || clinicaId,
        }))
        .filter((u: UsuarioItem) => u.perfil !== "IDOSO");

      setUsuarios(filtradosClinica);
    } catch (err: any) {
      setErro(err.message || "Falha ao buscar usuários.");
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  async function handleExcluir(usuario: UsuarioItem) {
    if (usuario.id === meuId) {
      setErro("Você não pode remover seu próprio usuário administrador.");
      return;
    }

    const confirmou = window.confirm(
      `Deseja realmente remover o acesso de "${usuario.nome}" (${usuario.email})?`
    );
    if (!confirmou) return;

    setExcluindoId(usuario.id);
    setErro("");
    setMensagem("");

    try {
      const res = await fetch(`${API_URL}/usuario/${usuario.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Não foi possível remover o usuário."
        );
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      setMensagem(`Usuário "${usuario.nome}" removido com sucesso.`);
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Erro ao excluir usuário.");
    } finally {
      setExcluindoId(null);
    }
  }

  function badgePerfil(perfil: string) {
    if (perfil === "ADMINISTRADOR")
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (perfil === "MEDICO")
      return "bg-blue-50 text-[#1565C0] border-blue-200";
    if (perfil === "ENFERMEIRO" || perfil === "CUIDADOR")
      return "bg-teal-50 text-teal-700 border-teal-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const batePerfil =
      filtroPerfil === "TODOS" || u.perfil === filtroPerfil;
    const termo = busca.trim().toLowerCase();
    const bateBusca =
      !termo ||
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo);
    return batePerfil && bateBusca;
  });

  if (autorizado === false) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldAlert size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#0A2540]">
            Acesso Restrito
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Apenas Administradores podem gerenciar os usuários da clínica.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Equipe & Familiares
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Usuários da Clínica
            </h1>
            <p className="mt-2 text-gray-600">
              Pré-cadastre e gerencie médicos, enfermeiros, cuidadores e
              familiares autorizados.
            </p>
          </div>

          <Link
            href="/dashboard/usuarios/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
          >
            <Plus size={18} />
            Novo Usuário
          </Link>
        </div>

        {mensagem && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{mensagem}</p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#1565C0]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "Todos", valor: "TODOS" },
                { label: "Admins", valor: "ADMINISTRADOR" },
                { label: "Médicos", valor: "MEDICO" },
                { label: "Enfermeiros", valor: "ENFERMEIRO" },
                { label: "Cuidadores", valor: "CUIDADOR" },
                { label: "Familiares", valor: "FAMILIAR" },
              ].map((item) => (
                <button
                  key={item.valor}
                  type="button"
                  onClick={() => setFiltroPerfil(item.valor)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    filtroPerfil === item.valor
                      ? "bg-[#1565C0] text-white"
                      : "border border-gray-200 bg-[#FAFCFE] text-gray-600 hover:text-[#0A2540]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {carregando ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                <Loader2 size={24} className="animate-spin text-[#1565C0]" />
                <span className="ml-2">Carregando usuários...</span>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
                <Users size={34} className="mx-auto text-gray-300" />
                <p className="mt-3 font-semibold text-[#0A2540]">
                  Nenhum usuário encontrado
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Ajuste os filtros ou cadastre um novo membro da equipe ou
                  familiar.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {usuariosFiltrados.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-semibold text-[#0A2540]">{u.nome}</p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgePerfil(
                            u.perfil
                          )}`}
                        >
                          {u.perfil}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail size={13} />
                          {u.email}
                        </span>
                        {u.especialidade && <span>• {u.especialidade}</span>}
                        {u.telefone && <span>• {u.telefone}</span>}
                      </div>
                    </div>

                    {u.id !== meuId && (
                      <button
                        type="button"
                        disabled={excluindoId === u.id}
                        onClick={() => handleExcluir(u)}
                        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:self-center"
                      >
                        {excluindoId === u.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}