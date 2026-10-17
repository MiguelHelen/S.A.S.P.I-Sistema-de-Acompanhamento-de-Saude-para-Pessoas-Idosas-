"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Loader2,
  ShieldAlert,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  X,
  Save,
} from "lucide-react";

interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  perfil: string;
  clinica_id: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function GerenciarUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("TODOS");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioItem | null>(
    null,
  );
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [usuarioParaExcluir, setUsuarioParaExcluir] =
    useState<UsuarioItem | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    async function carregarUsuarios() {
      const token = localStorage.getItem("saspi_token");
      const userRaw = localStorage.getItem("saspi_user");
      let clinicaId = "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

      if (!userRaw) {
        setAutorizado(false);
        setCarregando(false);
        return;
      }

      try {
        const parsed = JSON.parse(userRaw);
        const userData = parsed.user || parsed.usuario || parsed;
        const perfil = String(
          userData.perfil || userData.role || "",
        ).toUpperCase();

        if (perfil !== "ADMINISTRADOR" && perfil !== "ADMIN") {
          setAutorizado(false);
          setCarregando(false);
          return;
        }
        setAutorizado(true);
        clinicaId = userData.clinica_id || userData.clinicaId || clinicaId;
      } catch {
        setAutorizado(false);
        setCarregando(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/usuario?clinica_id=${clinicaId}`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });

        if (res.ok) {
          const data = await res.json();
          const lista = Array.isArray(data) ? data : data.data || [];
          setUsuarios(
            lista.filter(
              (u: UsuarioItem) => !u.clinica_id || u.clinica_id === clinicaId,
            ),
          );
        }
      } catch {
        setErroAcao("Não foi possível carregar a lista de usuários.");
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuarios();
  }, []);

  async function salvarEdicaoUsuario(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioEditando) return;

    setSalvandoEdicao(true);
    setErroAcao("");
    const token = localStorage.getItem("saspi_token");

    const cpfLimpo = (usuarioEditando.cpf || "").replace(/\D/g, "");
    const telLimpo = (usuarioEditando.telefone || "").replace(/\D/g, "");

    if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      setErroAcao("O CPF deve conter exatamente 11 dígitos numéricos.");
      setSalvandoEdicao(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/usuario/${usuarioEditando.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          nome: usuarioEditando.nome.trim(),
          cpf: cpfLimpo.length > 0 ? cpfLimpo : undefined,
          telefone: telLimpo.length > 0 ? telLimpo : undefined,
          perfil: usuarioEditando.perfil,
        }),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message || "Falha ao atualizar usuário.";
        throw new Error(msg);
      }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === usuarioEditando.id
            ? {
                ...u,
                nome: usuarioEditando.nome.trim(),
                cpf: cpfLimpo || null,
                telefone: telLimpo || null,
                perfil: usuarioEditando.perfil,
              }
            : u,
        ),
      );

      setUsuarioEditando(null);
      setMensagemSucesso("Dados do usuário atualizados com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 4000);
    } catch (err: any) {
      setErroAcao(err.message || "Erro ao salvar alterações do usuário.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function confirmarExclusaoUsuario() {
    if (!usuarioParaExcluir) return;

    setExcluindo(true);
    setErroAcao("");
    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(`${API_URL}/usuario/${usuarioParaExcluir.id}`, {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });

      const errData = await res.json().catch(() => null);

      if (!res.ok) {
        const rawMsg = String(errData?.message || "").toLowerCase();
        if (
          res.status === 409 ||
          res.status === 500 ||
          rawMsg.includes("foreign key") ||
          rawMsg.includes("constraint") ||
          rawMsg.includes("p2003")
        ) {
          throw new Error(
            "Não é possível excluir este usuário pois ele possui prescrições ou registros de atendimento vinculados.",
          );
        }
        throw new Error(
          errData?.message || "Não foi possível remover este usuário.",
        );
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioParaExcluir.id));
      setUsuarioParaExcluir(null);
      setMensagemSucesso("Usuário removido do sistema com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 4000);
    } catch (err: any) {
      setUsuarioParaExcluir(null);
      setErroAcao(err.message || "Erro ao excluir usuário.");
    } finally {
      setExcluindo(false);
    }
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const batePerfil =
      filtroPerfil === "TODOS" ||
      String(u.perfil || "").toUpperCase() === filtroPerfil;
    const termo = busca.trim().toLowerCase();
    const bateBusca =
      !termo ||
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      String(u.cpf || "").includes(termo);
    return batePerfil && bateBusca;
  });

  if (carregando || autorizado === null) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500">
          <Loader2 size={24} className="mx-auto animate-spin text-[#1565C0]" />
          <p className="mt-2 text-sm font-medium">
            Carregando equipe e usuários da instituição...
          </p>
        </div>
      </main>
    );
  }

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
            Apenas Administradores possuem permissão para gerenciar os usuários
            da instituição.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white"
            >
              <ArrowLeft size={16} />
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
            >
              <ArrowLeft size={17} />
              Voltar para o Painel Administrativo
            </Link>

            <span className="mt-6 block text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Gestão de Equipe & Acessos
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Usuários Cadastrados ({usuarios.length})
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Visualize, edite permissões e gerencie médicos, enfermeiros,
              cuidadores e familiares da instituição.
            </p>
          </div>

          <Link
            href="/dashboard/usuarios/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540]"
          >
            <UserPlus size={19} />
            Novo Usuário
          </Link>
        </div>

        {mensagemSucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{mensagemSucesso}</p>
          </div>
        )}

        {erroAcao && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erroAcao}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, e-mail ou CPF..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
            />
          </div>

          <select
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[#1565C0]"
          >
            <option value="TODOS">Todos os Perfis</option>
            <option value="MEDICO">Médicos</option>
            <option value="ENFERMEIRO">Enfermeiros</option>
            <option value="CUIDADOR">Cuidadores</option>
            <option value="FAMILIAR">Familiares</option>
            <option value="ADMINISTRADOR">Administradores</option>
          </select>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {usuariosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 text-base font-semibold text-[#0A2540]">
                Nenhum usuário encontrado com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">Nome / E-mail</th>
                    <th className="px-6 py-4">Perfil</th>
                    <th className="px-6 py-4">CPF</th>
                    <th className="px-6 py-4">Telefone</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="transition hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#0A2540]">{u.nome}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1565C0]">
                          {u.perfil}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {u.cpf || "Não informado"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {u.telefone || "Não informado"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUsuarioEditando({ ...u })}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#1565C0] transition hover:bg-blue-100"
                          >
                            <Pencil size={13} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setUsuarioParaExcluir(u)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={13} />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Modal de Edição */}
        {usuarioEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <form
              onSubmit={salvarEdicaoUsuario}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-[#0A2540]">
                  Editar Usuário
                </h2>
                <button
                  type="button"
                  onClick={() => setUsuarioEditando(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={usuarioEditando.nome}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        nome: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                      CPF (11 dígitos)
                    </label>
                    <input
                      type="text"
                      value={usuarioEditando.cpf || ""}
                      onChange={(e) =>
                        setUsuarioEditando({
                          ...usuarioEditando,
                          cpf: e.target.value,
                        })
                      }
                      placeholder="000.000.000-00"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={usuarioEditando.telefone || ""}
                      onChange={(e) =>
                        setUsuarioEditando({
                          ...usuarioEditando,
                          telefone: e.target.value,
                        })
                      }
                      placeholder="(11) 99999-9999"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                    Perfil de Acesso *
                  </label>
                  <select
                    value={usuarioEditando.perfil}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        perfil: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                  >
                    <option value="MEDICO">Médico</option>
                    <option value="ENFERMEIRO">Enfermeiro</option>
                    <option value="CUIDADOR">Cuidador</option>
                    <option value="FAMILIAR">Familiar</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setUsuarioEditando(null)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white"
                >
                  {salvandoEdicao ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de Exclusão */}
        {usuarioParaExcluir && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <AlertTriangle size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#0A2540]">
                    Excluir Usuário
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setUsuarioParaExcluir(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-600">
                  Confirma a exclusão permanente de{" "}
                  <strong>{usuarioParaExcluir.nome}</strong>? O acesso desta
                  credencial será revogado imediatamente.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setUsuarioParaExcluir(null)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarExclusaoUsuario}
                  disabled={excluindo}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white"
                >
                  {excluindo ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
