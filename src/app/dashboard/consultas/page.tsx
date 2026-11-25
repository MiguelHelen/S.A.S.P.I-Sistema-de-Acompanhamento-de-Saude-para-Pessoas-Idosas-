"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function ConsultasPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [userPerfil, setUserPerfil] = useState<string>("");

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

  async function alterarStatus(
    consultaId: string,
    novoStatus: "Agendada" | "Confirmada" | "Realizada" | "Cancelada",
  ) {
    setAtualizandoId(consultaId);
    try {
      const res = await fetch(`${API_URL}/consulta/${consultaId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ status: novoStatus }),
      });

      if (res.ok) {
        setConsultas((prev) =>
          prev.map((c) =>
            c.id === consultaId ? { ...c, status: novoStatus } : c,
          ),
        );
      }
    } catch {
      // Falha silenciosa
    } finally {
      setAtualizandoId(null);
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
    userPerfil !== "FAMILIAR" && userPerfil !== "ADMINISTRADOR";

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
            <a
              href="/dashboard/consultas/nova"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <Plus size={18} />
              Agendar Consulta
            </a>
          )}
        </div>

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
                              statusUpper,
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
                            onClick={() => alterarStatus(c.id, "Realizada")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            Realizada
                          </button>
                          <button
                            type="button"
                            disabled={atualizandoId === c.id}
                            onClick={() => alterarStatus(c.id, "Cancelada")}
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
