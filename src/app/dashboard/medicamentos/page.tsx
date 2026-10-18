"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import {
  Pill,
  Plus,
  Loader2,
  Ban,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  UserCheck,
} from "lucide-react";

interface Prescricao {
  id: string;
  idoso_id?: string;
  medicamento_id?: string;
  medicamento?: {
    nome?: string;
    descricao?: string;
  };
  usuario?: {
    nome?: string;
  };
  dosagem?: string;
  frequencia?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function MedicamentosPage() {
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState("");
  const [encerrandoId, setEncerrandoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const carregarPrescricoes = useCallback(async (idosoId: string) => {
    setCarregando(true);
    const token = localStorage.getItem("saspi_token");
    const headers = { ...(token && { Authorization: `Bearer ${token}` }) };

    try {
      const res = await fetch(`${API_URL}/prescricao/idoso/${idosoId}`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data || [];
        setPrescricoes(
          lista.filter((p: any) => !p.idoso_id || p.idoso_id === idosoId)
        );
      } else {
        setPrescricoes([]);
      }
    } catch {
      setPrescricoes([]);
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

    const saved = localStorage.getItem("saspi_active_elderly");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIdosoAtivo(parsed);
        if (parsed?.id) {
          carregarPrescricoes(parsed.id);
        }
      } catch {}
    }
  }, [carregarPrescricoes]);

  function handleSelectPatient(idoso: Idoso) {
    setIdosoAtivo(idoso);
    if (idoso?.id) {
      carregarPrescricoes(idoso.id);
    }
  }

  async function encerrarPrescricao(idPrescricao: string) {
    setEncerrandoId(idPrescricao);
    setErro("");
    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(
        `${API_URL}/prescricao/${idPrescricao}/encerrar`,
        {
          method: "PATCH",
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Não foi possível encerrar a prescrição."
        );
      }

      const hojeIso = new Date().toISOString();
      setPrescricoes((prev) =>
        prev.map((p) =>
          p.id === idPrescricao
            ? { ...p, status: "ENCERRADA", data_fim: hojeIso }
            : p
        )
      );
      setMensagem(
        "Prescrição encerrada com sucesso! O registro foi preservado no histórico clínico."
      );
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Falha ao encerrar prescrição.");
    } finally {
      setEncerrandoId(null);
    }
  }

  // Alinhado ao PrescricaoService do backend: apenas MEDICO registra ou encerra prescrições
  const podePrescrever = perfilUsuario === "MEDICO";

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Farmacoterapia & Prescrições
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Plano de Medicamentos
            </h1>
            <p className="mt-2 text-gray-600">
              {idosoAtivo
                ? `Prescrições e horários de dosagem de ${idosoAtivo.nome}.`
                : "Selecione um paciente para visualizar a medicação."}
            </p>
          </div>

          {podePrescrever && (
            <Link
              href="/dashboard/medicamentos/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <Plus size={18} />
              Nova Prescrição
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

        <div className="mt-8 space-y-6">
          <PatientSelector
            onSelect={handleSelectPatient}
            selectedId={idosoAtivo?.id}
          />

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Pill size={20} />
                </div>
                <h2 className="text-lg font-semibold text-[#0A2540]">
                  Prescrições Médicas Registradas
                </h2>
              </div>
              <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {prescricoes.length} registradas
              </span>
            </div>

            <div className="mt-6">
              {carregando ? (
                <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                  <Loader2 size={24} className="animate-spin text-[#1565C0]" />
                  <span className="ml-2">Buscando prescrições no banco...</span>
                </div>
              ) : prescricoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                    <Pill size={28} />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Nenhuma prescrição encontrada
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-gray-500">
                    Não existem medicamentos prescritos registrados para este
                    paciente até o momento.
                  </p>
                  {podePrescrever && (
                    <Link
                      href="/dashboard/medicamentos/novo"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E8F1FB] px-4 py-2 text-sm font-medium text-[#1565C0] transition hover:bg-[#1565C0] hover:text-white"
                    >
                      <Plus size={16} />
                      Adicionar primeiro medicamento
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {prescricoes.map((p) => {
                    const isAtiva =
                      String(p.status || "ATIVA").toUpperCase() === "ATIVA";
                    const dataInicioBr = p.data_inicio
                      ? new Date(p.data_inicio).toLocaleDateString("pt-BR", {
                          timeZone: "UTC",
                        })
                      : null;
                    const dataFimBr = p.data_fim
                      ? new Date(p.data_fim).toLocaleDateString("pt-BR", {
                          timeZone: "UTC",
                        })
                      : null;

                    return (
                      <div
                        key={p.id}
                        className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-[#0A2540]">
                            {p.medicamento?.nome || "Medicamento Prescrito"}
                          </p>
                          <p className="text-sm font-medium text-gray-600">
                            {p.dosagem || "Dosagem padrão"} •{" "}
                            {p.frequencia || "Uso contínuo"}
                          </p>
                          {p.medicamento?.descricao && (
                            <p className="text-xs text-gray-500">
                              Orientações: {p.medicamento.descricao}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-400">
                            {dataInicioBr && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays size={13} />
                                Início: {dataInicioBr}
                                {dataFimBr
                                  ? ` • Fim: ${dataFimBr}`
                                  : " • Uso contínuo"}
                              </span>
                            )}
                            {p.usuario?.nome && (
                              <span className="inline-flex items-center gap-1 text-[#1565C0]">
                                <UserCheck size={13} />
                                Prescrito por: Dr(a). {p.usuario.nome}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isAtiva
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isAtiva ? "Ativa" : "Encerrada"}
                          </span>

                          {podePrescrever && isAtiva && (
                            <button
                              type="button"
                              disabled={encerrandoId === p.id}
                              onClick={() => encerrarPrescricao(p.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                            >
                              {encerrandoId === p.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Ban size={13} />
                              )}
                              Encerrar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}