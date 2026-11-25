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
  Send,
  Clock,
  CheckCircle,
  Ban,
  X,
} from "lucide-react";

interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  status: string;
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
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  const [usuarioParaExcluir, setUsuarioParaExcluir] =
    useState<UsuarioItem | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [reenviandoId, setReenviandoId] = useState<string | null>(null);

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
          status: String(u.status || "ATIVO").toUpperCase(),
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

  async function handleReenviarConvite(usuario: UsuarioItem) {
    setReenviandoId(usuario.id);
    setErro("");
    setMensagem("");

    try {
      const res = await fetch(`${API_URL}/auth/reenviar-convite`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ usuario_id: usuario.id }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(msg || "Não foi possível reenviar o convite.");
      }

      setMensagem(
        data?.message ||
          `Novo link de ativação reenviado para ${usuario.email}.`
      );
      setTimeout(() => setMensagem(""), 5000);
    } catch (err: any) {
      setErro(err.message || "Falha ao reenviar convite por e-mail.");
    } finally {
      setReenviandoId(null);
    }
  }

  async function confirmarExclusao() {
    if (!usuarioParaExcluir) return;

    if (usuarioParaExcluir.id === meuId) {
      setErro("Você não pode remover seu próprio usuário administrador.");
      setUsuarioParaExcluir(null);
      return;
    }

    const alvo = usuarioParaExcluir;
    setExcluindoId(alvo.id);
    setErro("");
    setMensagem("");

    try {
      const res = await fetch(`${API_URL}/usuario/${alvo.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Não foi possível remover o usuário."
        );
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== alvo.id));
      setMensagem(
        `Acesso de "${alvo.nome}" (${alvo.email}) removido com sucesso.`
      );
      setUsuarioParaExcluir(null);
      setTimeout(() => setMensagem(""), 4500);
    } catch (err: any) {
      setErro(err.message || "Erro ao excluir usuário.");
      setUsuarioParaExcluir(null);
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

  function renderBadgeStatus(status: string) {
    if (status === "PENDENTE") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
          <Clock size={11} />
          Convite Pendente
        </span>
      );
    }
    if (status === "BLOQUEADO") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
          <Ban size={11} />
          Bloqueado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle size={11} />
        Ativo
      </span>
    );
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const batePerfil =
      filtroPerfil === "TODOS" || u.perfil === filtroPerfil;
    const bateStatus =
      filtroStatus === "TODOS" || u.status === filtroStatus;
    const termo = busca.trim().toLowerCase();
    const bateBusca =
      !termo ||
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo);
    return batePerfil && bateStatus && bateBusca;
  });

  const totalPendentes = usuarios.filter((u) => u.status === "PENDENTE").length;

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
              Convide e gerencie médicos, enfermeiros, cuidadores e familiares
              autorizados na instituição.
            </p>
          </div>

          <Link
            href="/dashboard/usuarios/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={18} />
            Convidar Usuário
          </Link>
        </div>

        {mensagem && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{mensagem}</p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

            <div className="flex flex-wrap items-center gap-2">
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

              <span className="mx-1 hidden h-5 w-px bg-gray-200 sm:inline-block" />

              <button
                type="button"
                onClick={() =>
                  setFiltroStatus((prev) =>
                    prev === "PENDENTE" ? "TODOS" : "PENDENTE"
                  )
                }
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  filtroStatus === "PENDENTE"
                    ? "bg-amber-600 text-white"
                    : "border border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100"
                }`}
              >
                <Clock size={12} />
                Pendentes ({totalPendentes})
              </button>
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
                  Ajuste os filtros ou envie um convite para um novo membro da
                  equipe ou familiar.
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#0A2540]">{u.nome}</p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgePerfil(
                            u.perfil
                          )}`}
                        >
                          {u.perfil}
                        </span>
                        {renderBadgeStatus(u.status)}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail size={13} />
                          {u.email}
                        </span>
                        {u.especialidade && <span>• {u.especialidade}</span>}
                        {u.telefone && <span>• {u.telefone}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                      {u.status === "PENDENTE" && (
                        <button
                          type="button"
                          disabled={reenviandoId === u.id}
                          onClick={() => handleReenviarConvite(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                        >
                          {reenviandoId === u.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Send size={13} />
                          )}
                          Reenviar Convite
                        </button>
                      )}

                      {u.id !== meuId && (
                        <button
                          type="button"
                          disabled={excluindoId === u.id}
                          onClick={() => setUsuarioParaExcluir(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Remoção (substitui window.confirm nativo) */}
      {usuarioParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={22} />
              </div>
              <button
                type="button"
                onClick={() => setUsuarioParaExcluir(null)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#0A2540]">
              Remover acesso do usuário?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Você está prestes a revogar o acesso de{" "}
              <strong className="text-[#0A2540]">
                {usuarioParaExcluir.nome}
              </strong>{" "}
              ({usuarioParaExcluir.email}). Esta ação removerá o cadastro e os
              vínculos assistenciais associados.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={Boolean(excluindoId)}
                onClick={() => setUsuarioParaExcluir(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={Boolean(excluindoId)}
                onClick={confirmarExclusao}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {excluindoId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {excluindoId ? "Removendo..." : "Confirmar Remoção"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}