"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import {
  CalendarDays,
  MapPin,
  Stethoscope,
  Plus,
  Loader2,
  CheckCircle2,
  Ban,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Consulta {
  id: string;
  idoso_id?: string;
  especialidade: string;
  medico?: string;
  data?: string;
  horario?: string;
  localizacao?: string;
  observacao?: string | null;
  status: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function ConsultasPage() {
  const [activeElderly, setActiveElderly] = useState<Idoso | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState("");
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const carregarConsultas = useCallback(async (idosoId: string) => {
    setCarregando(true);
    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(`${API_URL}/consulta?idoso_id=${idosoId}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });

      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data || [];
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
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        const userData = parsed.user || parsed.usuario || parsed;
        setPerfilUsuario(
          String(userData.perfil || userData.role || "").toUpperCase()
        );
      } catch {}
    }

    const storedElderly = localStorage.getItem("saspi_active_elderly");
    if (storedElderly) {
      try {
        const parsed = JSON.parse(storedElderly);
        setActiveElderly(parsed);
        if (parsed?.id) {
          carregarConsultas(parsed.id);
        }
      } catch {}
    }
  }, [carregarConsultas]);

  function handleSelectElderly(novo: Idoso) {
    setActiveElderly(novo);
    if (novo?.id) {
      carregarConsultas(novo.id);
    }
  }

  async function alterarStatusConsulta(id: string, novoStatus: string) {
    setAtualizandoId(id);
    setErro("");
    setMensagem("");
    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(`${API_URL}/consulta/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Não foi possível atualizar o status da consulta."
        );
      }

      setConsultas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: novoStatus } : c))
      );
      window.dispatchEvent(new Event("saspi_elderly_updated"));
      setMensagem(
        `Status da consulta atualizado para "${novoStatus}" com sucesso!`
      );
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Falha ao atualizar consulta.");
    } finally {
      setAtualizandoId(null);
    }
  }

  const podeGerenciar = perfilUsuario !== "FAMILIAR";

  function obterCorStatus(status?: string) {
    const s = String(status || "Agendada");
    if (s === "Cancelada") return "bg-red-50 text-red-700";
    if (s === "Realizada") return "bg-emerald-50 text-emerald-700";
    if (s === "Confirmada") return "bg-teal-50 text-teal-700";
    return "bg-[#E8F1FB] text-[#1565C0]";
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Agenda de saúde
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540]">
              Consultas
            </h1>
            <p className="mt-2 text-gray-600">
              {activeElderly
                ? `Acompanhe agendamentos de ${activeElderly.nome}.`
                : "Selecione um paciente para visualizar os agendamentos clínicos."}
            </p>
          </div>

          {podeGerenciar && (
            <Link
              href="/dashboard/consultas/nova"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm hover:bg-[#0A2540]"
            >
              <Plus size={19} />
              Nova consulta
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
            onSelect={handleSelectElderly}
            selectedId={activeElderly?.id}
          />
        </div>

        <div className="mt-8">
          {carregando ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 size={24} className="animate-spin text-[#1565C0]" />
              <span className="ml-2">Buscando consultas na base...</span>
            </div>
          ) : consultas.length > 0 ? (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Consultas registradas ({consultas.length})
              </h2>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {consultas.map((c) => {
                  const dataBr = c.data
                    ? new Date(c.data).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      })
                    : "--";
                  const statusAtual = c.status || "Agendada";
                  const encerrada =
                    statusAtual === "Cancelada" || statusAtual === "Realizada";

                  return (
                    <article
                      key={c.id}
                      className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-[#FAFCFE] p-6 shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                            <Stethoscope size={24} />
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${obterCorStatus(
                              statusAtual
                            )}`}
                          >
                            {statusAtual}
                          </span>
                        </div>

                        <div className="mt-5">
                          <h3 className="text-xl font-semibold text-[#0A2540]">
                            {c.especialidade}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-gray-500">
                            Profissional: {c.medico}
                          </p>
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                              <CalendarDays size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Data e Horário</p>
                              <p className="text-sm font-semibold text-[#0A2540]">
                                {dataBr} às {c.horario}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                              <MapPin size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500">
                                Local da Consulta
                              </p>
                              <p className="mt-0.5 wrap-break-word text-sm font-semibold leading-snug text-[#0A2540]">
                                {c.localizacao}
                              </p>
                            </div>
                          </div>

                          {c.observacao && (
                            <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                <FileText size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500">
                                  Observações e Preparo
                                </p>
                                <p className="mt-0.5 wrap-break-word text-sm text-gray-700">
                                  {c.observacao}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {podeGerenciar && !encerrada && (
                        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200/70 pt-4">
                          {statusAtual === "Agendada" && (
                            <button
                              type="button"
                              disabled={atualizandoId === c.id}
                              onClick={() =>
                                alterarStatusConsulta(c.id, "Confirmada")
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1565C0] transition hover:bg-blue-100 disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} />
                              Confirmar
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={atualizandoId === c.id}
                            onClick={() =>
                              alterarStatusConsulta(c.id, "Realizada")
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            Concluir (Realizada)
                          </button>

                          <button
                            type="button"
                            disabled={atualizandoId === c.id}
                            onClick={() =>
                              alterarStatusConsulta(c.id, "Cancelada")
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <Ban size={14} />
                            Cancelar
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <Stethoscope size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 font-semibold text-[#0A2540]">
                Nenhuma consulta agendada
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}