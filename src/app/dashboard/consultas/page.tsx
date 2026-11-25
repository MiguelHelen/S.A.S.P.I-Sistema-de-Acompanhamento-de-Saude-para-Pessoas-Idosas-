"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import {
  API_URL,
  getAuthHeaders,
  getIdosoAtivoSessao,
  getUsuarioSessao,
  isAdminPerfil,
} from "@/lib/clinica";
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Stethoscope,
  ShieldAlert,
  User,
  AlertCircle,
} from "lucide-react";

interface Consulta {
  id: string;
  especialidade: string;
  medico: string;
  data: string;
  horario: string;
  localizacao?: string;
  observacao?: string;
  status: string;
}

interface ConfirmacaoAcao {
  consulta: Consulta;
  novoStatus: "Realizada" | "Cancelada";
}

export default function ConsultasPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [userPerfil, setUserPerfil] = useState<string>("");
  const [confirmacao, setConfirmacao] = useState<ConfirmacaoAcao | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const sessao = getUsuarioSessao();
    if (!sessao || isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      setCarregando(false);
      return;
    }

    setAutorizado(true);
    setUserPerfil(sessao.perfil);

    const ativo = getIdosoAtivoSessao<Idoso>();
    if (ativo?.id) {
      setIdosoAtivo(ativo);
    } else {
      setCarregando(false);
    }
  }, []);

  const carregarConsultas = useCallback(async (pacienteId: string) => {
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/consulta/idoso/${pacienteId}`, {
        headers: getAuthHeaders(false),
      });

      if (res.ok) {
        const raw = await res.json();
        const lista = Array.isArray(raw) ? raw : raw?.data || [];
        setConsultas(lista);
      } else {
        setConsultas([]);
      }
    } catch {
      setConsultas([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (idosoAtivo?.id && autorizado === true) {
      carregarConsultas(idosoAtivo.id);
    }
  }, [idosoAtivo, autorizado, carregarConsultas]);

  function handleSelectIdoso(selecionado: Idoso) {
    setIdosoAtivo(selecionado);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(selecionado));
    window.dispatchEvent(new Event("saspi_elderly_updated"));
  }

  async function confirmarAlteracaoStatus() {
    if (!confirmacao) return;
    const { consulta, novoStatus } = confirmacao;

    setAtualizandoId(consulta.id);
    setErro("");
    setMensagem("");

    try {
      const res = await fetch(`${API_URL}/consulta/${consulta.id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Não foi possível atualizar o status da consulta."
        );
      }

      setConsultas((prev) =>
        prev.map((c) =>
          c.id === consulta.id ? { ...c, status: novoStatus } : c
        )
      );
      setMensagem(
        novoStatus === "Realizada"
          ? `Consulta de ${consulta.especialidade} marcada como realizada.`
          : `Consulta de ${consulta.especialidade} cancelada.`
      );
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Falha ao atualizar status da consulta.");
    } finally {
      setAtualizandoId(null);
      setConfirmacao(null);
    }
  }

  function badgeStatus(status: string) {
    const s = (status || "").toUpperCase();
    if (s === "REALIZADA") return "bg-emerald-50 text-emerald-700";
    if (s === "CONFIRMADA") return "bg-teal-50 text-teal-700";
    if (s === "CANCELADA") return "bg-red-50 text-red-700";
    return "bg-blue-50 text-[#1565C0]";
  }

  const podeGerenciarConsultas =
    userPerfil !== "FAMILIAR" && !isAdminPerfil(userPerfil);

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
            A agenda clínica de consultas é destinada aos profissionais de saúde
            e familiares vinculados.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      {/* Modal de Confirmação de Status */}
      {confirmacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                confirmacao.novoStatus === "Realizada"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {confirmacao.novoStatus === "Realizada" ? (
                <CheckCircle2 size={24} />
              ) : (
                <XCircle size={24} />
              )}
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#0A2540]">
              {confirmacao.novoStatus === "Realizada"
                ? "Confirmar Consulta Realizada?"
                : "Cancelar Consulta Agendada?"}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {confirmacao.novoStatus === "Realizada" ? (
                <>
                  Deseja registrar que o atendimento de{" "}
                  <strong className="text-[#0A2540]">
                    {confirmacao.consulta.especialidade}
                  </strong>{" "}
                  com{" "}
                  <strong className="text-[#0A2540]">
                    {confirmacao.consulta.medico}
                  </strong>{" "}
                  foi concluído?
                </>
              ) : (
                <>
                  Deseja realmente cancelar o agendamento de{" "}
                  <strong className="text-[#0A2540]">
                    {confirmacao.consulta.especialidade}
                  </strong>{" "}
                  marcado para às {confirmacao.consulta.horario}?
                </>
              )}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={atualizandoId === confirmacao.consulta.id}
                onClick={() => setConfirmacao(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>

              <button
                type="button"
                disabled={atualizandoId === confirmacao.consulta.id}
                onClick={confirmarAlteracaoStatus}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                  confirmacao.novoStatus === "Realizada"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {atualizandoId === confirmacao.consulta.id && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {confirmacao.novoStatus === "Realizada"
                  ? "Confirmar Conclusão"
                  : "Confirmar Cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Agenda Médica
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Consultas & Acompanhamentos
            </h1>
            <p className="mt-2 text-gray-600">
              Agendamentos clínicos, retornos médicos e histórico de
              atendimentos.
            </p>
          </div>

          {podeGerenciarConsultas && (
            <Link
              href="/dashboard/consultas/nova"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <Plus size={18} />
              Agendar Consulta
            </Link>
          )}
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

        <div className="mt-6">
          <PatientSelector
            selectedId={idosoAtivo?.id}
            onSelect={handleSelectIdoso}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <Calendar size={20} className="text-[#1565C0]" />
            <h2 className="text-lg font-semibold text-[#0A2540]">
              Compromissos de {idosoAtivo?.nome || "Paciente"} (
              {consultas.length})
            </h2>
          </div>

          <div className="mt-6">
            {carregando ? (
              <div className="flex items-center justify-center py-10 text-sm text-gray-500">
                <Loader2 size={22} className="animate-spin text-[#1565C0]" />
                <span className="ml-2">Carregando agenda...</span>
              </div>
            ) : consultas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
                <Stethoscope size={32} className="mx-auto text-gray-300" />
                <p className="mt-3 font-medium text-[#0A2540]">
                  Nenhuma consulta agendada
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {podeGerenciarConsultas
                    ? "Clique em 'Agendar Consulta' para marcar um novo atendimento."
                    : "Nenhuma consulta cadastrada no momento."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultas.map((c) => {
                  const dt = new Date(c.data);
                  const dataFmt = Number.isNaN(dt.getTime())
                    ? c.data
                    : dt.toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      });
                  const statusLabel = c.status || "Agendada";
                  const statusUpper = statusLabel.toUpperCase();
                  const emAberto =
                    statusUpper === "AGENDADA" || statusUpper === "CONFIRMADA";

                  return (
                    <div
                      key={c.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-[#FAFCFE] p-5 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base font-bold text-[#0A2540]">
                            {c.especialidade}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStatus(
                              statusUpper
                            )}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          {c.medico && (
                            <span className="flex items-center gap-1 font-medium text-[#0A2540]">
                              <User size={14} className="text-[#1565C0]" />
                              {c.medico}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-[#1565C0]" />
                            {dataFmt}
                          </span>
                          {c.horario && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} className="text-[#26A69A]" />
                              {c.horario}
                            </span>
                          )}
                          {c.localizacao && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-400" />
                              {c.localizacao}
                            </span>
                          )}
                        </div>

                        {c.observacao && (
                          <p className="text-xs text-gray-500">
                            Obs.: {c.observacao}
                          </p>
                        )}
                      </div>

                      {podeGerenciarConsultas && emAberto && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={atualizandoId === c.id}
                            onClick={() =>
                              setConfirmacao({
                                consulta: c,
                                novoStatus: "Realizada",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            Realizada
                          </button>
                          <button
                            type="button"
                            disabled={atualizandoId === c.id}
                            onClick={() =>
                              setConfirmacao({
                                consulta: c,
                                novoStatus: "Cancelada",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}