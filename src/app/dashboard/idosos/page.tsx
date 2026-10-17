"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { calcularIdadeReal } from "@/components/PatientSelector";
import {
  ArrowLeft,
  HeartHandshake,
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

interface IdosoRegistro {
  id: string;
  nome: string;
  cpf?: string | null;
  data_nascimento: string;
  sexo?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  clinica_id: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function GerenciarIdososPage() {
  const [idosos, setIdosos] = useState<IdosoRegistro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [busca, setBusca] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const [idosoEditando, setIdosoEditando] = useState<IdosoRegistro | null>(
    null,
  );
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [idosoParaExcluir, setIdosoParaExcluir] =
    useState<IdosoRegistro | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const dataMaximaHoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function carregarIdosos() {
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
        const res = await fetch(`${API_URL}/idoso?clinica_id=${clinicaId}`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });

        if (res.ok) {
          const data = await res.json();
          const lista = Array.isArray(data) ? data : data.data || [];
          setIdosos(
            lista.filter(
              (i: IdosoRegistro) => !i.clinica_id || i.clinica_id === clinicaId,
            ),
          );
        }
      } catch {
        setErroAcao("Não foi possível carregar os pacientes cadastrados.");
      } finally {
        setCarregando(false);
      }
    }

    carregarIdosos();
  }, []);

  async function salvarEdicaoIdoso(e: React.FormEvent) {
    e.preventDefault();
    if (!idosoEditando) return;

    setSalvandoEdicao(true);
    setErroAcao("");
    const token = localStorage.getItem("saspi_token");

    const cpfLimpo = (idosoEditando.cpf || "").replace(/\D/g, "");
    const telLimpo = (idosoEditando.telefone || "").replace(/\D/g, "");
    const dataNascStr = idosoEditando.data_nascimento.split("T")[0];
    const anoNasc = Number(dataNascStr.split("-")[0]);

    if (!dataNascStr || anoNasc < 1900 || new Date(dataNascStr) > new Date()) {
      setErroAcao(
        "Data de nascimento inválida. Informe uma data real entre 1900 e hoje.",
      );
      setSalvandoEdicao(false);
      return;
    }

    if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      setErroAcao("O CPF do paciente deve conter 11 dígitos numéricos.");
      setSalvandoEdicao(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/idoso/${idosoEditando.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          nome: idosoEditando.nome.trim(),
          cpf: cpfLimpo.length > 0 ? cpfLimpo : undefined,
          data_nascimento: dataNascStr,
          sexo: idosoEditando.sexo || "Feminino",
          telefone: telLimpo.length > 0 ? telLimpo : undefined,
          endereco: (idosoEditando.endereco || "").trim() || undefined,
        }),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message || "Falha ao atualizar os dados do paciente.";
        throw new Error(msg);
      }

      setIdosos((prev) =>
        prev.map((i) =>
          i.id === idosoEditando.id
            ? {
                ...i,
                nome: idosoEditando.nome.trim(),
                cpf: cpfLimpo || null,
                data_nascimento: dataNascStr,
                sexo: idosoEditando.sexo,
                telefone: telLimpo || null,
                endereco: (idosoEditando.endereco || "").trim() || null,
              }
            : i,
        ),
      );

      setIdosoEditando(null);
      setMensagemSucesso("Cadastro do paciente atualizado com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 4000);
    } catch (err: any) {
      setErroAcao(err.message || "Erro ao atualizar paciente.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function confirmarExclusaoIdoso() {
    if (!idosoParaExcluir) return;

    setExcluindo(true);
    setErroAcao("");
    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(`${API_URL}/idoso/${idosoParaExcluir.id}`, {
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
            "Não é possível excluir este paciente pois ele possui registros clínicos, prescrições ou agendamentos vinculados no prontuário.",
          );
        }
        throw new Error(
          errData?.message || "Erro ao remover paciente do banco de dados.",
        );
      }

      setIdosos((prev) => prev.filter((i) => i.id !== idosoParaExcluir.id));
      setIdosoParaExcluir(null);
      setMensagemSucesso("Paciente removido com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 4000);
    } catch (err: any) {
      setIdosoParaExcluir(null);
      setErroAcao(err.message || "Falha ao excluir paciente.");
    } finally {
      setExcluindo(false);
    }
  }

  const idososFiltrados = idosos.filter((i) => {
    const termo = busca.trim().toLowerCase();
    return (
      !termo ||
      i.nome.toLowerCase().includes(termo) ||
      String(i.cpf || "").includes(termo) ||
      String(i.endereco || "")
        .toLowerCase()
        .includes(termo)
    );
  });

  if (carregando || autorizado === null) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500">
          <Loader2 size={24} className="mx-auto animate-spin text-[#1565C0]" />
          <p className="mt-2 text-sm font-medium">
            Carregando prontuários de admissão...
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
            Apenas Administradores possuem permissão para gerenciar a base
            cadastral de pacientes da clínica.
          </p>
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
              Gestão Institucional de Pacientes
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Idosos Cadastrados ({idosos.length})
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Gerencie os dados cadastrais, acomodações/leitos e informações de
              contato dos pacientes assistidos.
            </p>
          </div>

          <Link
            href="/dashboard/idosos/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540]"
          >
            <UserPlus size={19} />
            Admitir Novo Idoso
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

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar paciente por nome, CPF ou acomodação/leito..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
            />
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {idososFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <HeartHandshake size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 text-base font-semibold text-[#0A2540]">
                Nenhum paciente encontrado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">Paciente</th>
                    <th className="px-6 py-4">Idade / Nascimento</th>
                    <th className="px-6 py-4">CPF</th>
                    <th className="px-6 py-4">Acomodação / Endereço</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {idososFiltrados.map((i) => {
                    const idadeCalculada = calcularIdadeReal(i.data_nascimento);
                    const dataBr = i.data_nascimento
                      ? new Date(i.data_nascimento).toLocaleDateString(
                          "pt-BR",
                          { timeZone: "UTC" },
                        )
                      : "--";

                    return (
                      <tr key={i.id} className="transition hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#0A2540]">
                            {i.nome}
                          </p>
                          <p className="text-xs text-gray-500">
                            {i.sexo || "Não informado"} • Tel:{" "}
                            {i.telefone || "Não informado"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-[#0A2540]">
                            {idadeCalculada > 0
                              ? `${idadeCalculada} anos`
                              : "Data inválida"}
                          </span>
                          <p className="text-xs text-gray-500">{dataBr}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {i.cpf || "Não informado"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {i.endereco || "Leito não informado"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setIdosoEditando({
                                  ...i,
                                  data_nascimento: i.data_nascimento
                                    ? i.data_nascimento.split("T")[0]
                                    : "",
                                })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#1565C0] transition hover:bg-blue-100"
                            >
                              <Pencil size={13} />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setIdosoParaExcluir(i)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                            >
                              <Trash2 size={13} />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Modal de Edição de Idoso */}
        {idosoEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <form
              onSubmit={salvarEdicaoIdoso}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-[#0A2540]">
                  Editar Cadastro do Paciente
                </h2>
                <button
                  type="button"
                  onClick={() => setIdosoEditando(null)}
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
                    value={idosoEditando.nome}
                    onChange={(e) =>
                      setIdosoEditando({
                        ...idosoEditando,
                        nome: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      required
                      min="1900-01-01"
                      max={dataMaximaHoje}
                      value={idosoEditando.data_nascimento}
                      onChange={(e) =>
                        setIdosoEditando({
                          ...idosoEditando,
                          data_nascimento: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                      Sexo *
                    </label>
                    <select
                      value={idosoEditando.sexo || "Feminino"}
                      onChange={(e) =>
                        setIdosoEditando({
                          ...idosoEditando,
                          sexo: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                    >
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                      CPF (opcional, 11 dígitos)
                    </label>
                    <input
                      type="text"
                      value={idosoEditando.cpf || ""}
                      onChange={(e) =>
                        setIdosoEditando({
                          ...idosoEditando,
                          cpf: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={idosoEditando.telefone || ""}
                      onChange={(e) =>
                        setIdosoEditando({
                          ...idosoEditando,
                          telefone: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                    Endereço / Quarto / Observações
                  </label>
                  <textarea
                    rows={2}
                    value={idosoEditando.endereco || ""}
                    onChange={(e) =>
                      setIdosoEditando({
                        ...idosoEditando,
                        endereco: e.target.value,
                      })
                    }
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setIdosoEditando(null)}
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
        {idosoParaExcluir && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <AlertTriangle size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#0A2540]">
                    Excluir Paciente
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIdosoParaExcluir(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-600">
                  Tem certeza que deseja excluir o cadastro de{" "}
                  <strong>{idosoParaExcluir.nome}</strong>? Todos os vínculos
                  associados serão removidos.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setIdosoParaExcluir(null)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarExclusaoIdoso}
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
