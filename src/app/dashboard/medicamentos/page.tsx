"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import { getUsuarioSessao, isAdminPerfil } from "@/lib/clinica";
import {
  Pill,
  Plus,
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  AlertCircle,
  Clock3,
} from "lucide-react";

interface PrescricaoApi {
  id: string;
  idoso_id: string;
  medicamento_id: string;
  usuario_id?: string | null;
  dosagem: string;
  frequencia: string;
  status: "ATIVA" | "ENCERRADA" | string;
  data_inicio?: string | null;
  data_fim?: string | null;
  medicamento?: {
    id?: string;
    nome?: string | null;
    descricao?: string | null;
  } | null;
  usuario?: {
    id?: string;
    nome?: string | null;
    perfil?: string | null;
  } | null;
}

interface RegistroDoseApi {
  id: string;
  prescricao_id: string;
  status: "CONFIRMADA" | "RECUSADA" | "ATRASADA" | string;
  observacao?: string | null;
  data_hora?: string | null;
  prescricao?: {
    dosagem?: string | null;
    medicamento?: {
      nome?: string | null;
    } | null;
  } | null;
  usuario?: {
    nome?: string | null;
    perfil?: string | null;
  } | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

function formatarData(dataIso?: string | null): string {
  if (!dataIso) return "--";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "--";
  return data.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatarDataHora(dataIso?: string | null): string {
  if (!dataIso) return "--";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "--";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MedicamentosPage() {
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [perfilUsuario, setPerfilUsuario] = useState<string>("");
  const [prescricoes, setPrescricoes] = useState<PrescricaoApi[]>([]);
  const [registrosDose, setRegistrosDose] = useState<RegistroDoseApi[]>([]);

  const [carregando, setCarregando] = useState(false);
  const [acaoEmAndamentoId, setAcaoEmAndamentoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    const sessao = getUsuarioSessao();
    if (sessao?.perfil) {
      setPerfilUsuario(sessao.perfil);
    }

    const saved = localStorage.getItem("saspi_active_elderly");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setIdosoAtivo(parsed);
        }
      } catch {
        // Ignora JSON inválido no localStorage
      }
    }
  }, []);

  const carregarDadosPaciente = useCallback(async (idosoId: string) => {
    const token = localStorage.getItem("saspi_token");
    setCarregando(true);
    setErro(null);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const [resPrescricoes, resDoses] = await Promise.all([
        fetch(`${API_URL}/prescricao/idoso/${idosoId}`, { headers }),
        fetch(`${API_URL}/registro-dose/idoso/${idosoId}`, { headers }),
      ]);

      const dataPrescricoes = await resPrescricoes.json();

      if (!resPrescricoes.ok) {
        const msg = Array.isArray(dataPrescricoes?.message)
          ? dataPrescricoes.message.join(", ")
          : dataPrescricoes?.message ||
            "Não foi possível carregar as prescrições do paciente.";
        setErro(msg);
        setPrescricoes([]);
      } else {
        setPrescricoes(Array.isArray(dataPrescricoes) ? dataPrescricoes : []);
      }

      if (resDoses.ok) {
        const dataDoses = await resDoses.json();
        setRegistrosDose(Array.isArray(dataDoses) ? dataDoses : []);
      } else {
        setRegistrosDose([]);
      }
    } catch {
      setErro("Erro de conexão ao consultar prescrições e doses.");
      setPrescricoes([]);
      setRegistrosDose([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!idosoAtivo?.id) {
      setPrescricoes([]);
      setRegistrosDose([]);
      return;
    }
    carregarDadosPaciente(idosoAtivo.id);
  }, [idosoAtivo?.id, carregarDadosPaciente]);

  function handleSelectElderly(selectedIdoso: Idoso) {
    setIdosoAtivo(selectedIdoso);
    setAviso(null);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(selectedIdoso));
    window.dispatchEvent(new Event("saspi_elderly_updated"));
  }

  async function handleRegistrarDose(
    prescricaoId: string,
    statusDose: "CONFIRMADA" | "RECUSADA"
  ) {
    const token = localStorage.getItem("saspi_token");
    if (!token) {
      setErro("Sessão expirada ou não autenticada. Faça login novamente.");
      return;
    }

    setErro(null);
    setAviso(null);
    setAcaoEmAndamentoId(prescricaoId);

    try {
      const res = await fetch(`${API_URL}/registro-dose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prescricao_id: prescricaoId,
          status: statusDose,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível registrar a dose.";
        setErro(msg);
        return;
      }

      setAviso(
        statusDose === "CONFIRMADA"
          ? "Dose confirmada e registrada no histórico de adesão."
          : "Dose marcada como recusada/pulada no histórico de adesão."
      );

      if (idosoAtivo?.id) {
        await carregarDadosPaciente(idosoAtivo.id);
      }
    } catch {
      setErro("Erro de conexão ao registrar a dose.");
    } finally {
      setAcaoEmAndamentoId(null);
    }
  }

  async function handleEncerrarPrescricao(prescricaoId: string) {
    const token = localStorage.getItem("saspi_token");
    if (!token) {
      setErro("Sessão expirada ou não autenticada. Faça login novamente.");
      return;
    }

    setErro(null);
    setAviso(null);
    setAcaoEmAndamentoId(prescricaoId);

    try {
      const res = await fetch(`${API_URL}/prescricao/${prescricaoId}/encerrar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível encerrar a prescrição.";
        setErro(msg);
        return;
      }

      setAviso("Prescrição encerrada com sucesso.");
      if (idosoAtivo?.id) {
        await carregarDadosPaciente(idosoAtivo.id);
      }
    } catch {
      setErro("Erro de conexão ao encerrar a prescrição.");
    } finally {
      setAcaoEmAndamentoId(null);
    }
  }

  const podePrescrever = perfilUsuario === "MEDICO";
  const podeRegistrarDose =
    !isAdminPerfil(perfilUsuario) &&
    perfilUsuario !== "FAMILIAR" &&
    perfilUsuario !== "";

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Farmacoterapia e Adesão
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Medicamentos e Prescrições
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              {idosoAtivo ? (
                <>
                  Prescrições e registro de doses de{" "}
                  <strong className="text-[#0A2540]">{idosoAtivo.nome}</strong>.
                </>
              ) : (
                "Selecione um paciente para visualizar prescrições e confirmações de dose."
              )}
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

        <div className="mt-6">
          <PatientSelector
            onSelect={handleSelectElderly}
            selectedId={idosoAtivo?.id}
          />
        </div>

        {aviso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{aviso}</span>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{erro}</span>
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-[#0A2540]">
            Prescrições do Paciente
          </h2>

          {carregando ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
              <Loader2 size={18} className="animate-spin text-[#1565C0]" />
              Carregando prescrições...
            </div>
          ) : prescricoes.length > 0 ? (
            <div className="mt-5 space-y-4">
              {prescricoes.map((presc) => {
                const isAtiva = presc.status === "ATIVA";
                const nomeMedicamento =
                  presc.medicamento?.nome || "Medicamento prescrito";
                const ocupada = acaoEmAndamentoId === presc.id;

                return (
                  <div
                    key={presc.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-[#FAFCFE] p-4 lg:flex-row lg:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                        <Pill size={22} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#0A2540]">
                            {nomeMedicamento} — {presc.dosagem}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isAtiva
                                ? "bg-[#E6F4EF] text-[#26A69A]"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {presc.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                          Frequência: <strong>{presc.frequencia}</strong> • Início:{" "}
                          {formatarData(presc.data_inicio)}
                          {presc.data_fim
                            ? ` • Término: ${formatarData(presc.data_fim)}`
                            : ""}
                        </p>

                        {presc.usuario?.nome && (
                          <p className="mt-1 text-xs text-gray-400">
                            Prescrito por: {presc.usuario.nome}
                          </p>
                        )}
                      </div>
                    </div>

                    {isAtiva && (podeRegistrarDose || podePrescrever) && (
                      <div className="flex flex-wrap items-center gap-2">
                        {podeRegistrarDose && (
                          <>
                            <button
                              type="button"
                              disabled={ocupada}
                              onClick={() =>
                                handleRegistrarDose(presc.id, "CONFIRMADA")
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#26A69A] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                              <CheckCircle2 size={15} />
                              Confirmar Dose
                            </button>

                            <button
                              type="button"
                              disabled={ocupada}
                              onClick={() =>
                                handleRegistrarDose(presc.id, "RECUSADA")
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                            >
                              <XCircle size={15} />
                              Recusar
                            </button>
                          </>
                        )}

                        {podePrescrever && (
                          <button
                            type="button"
                            disabled={ocupada}
                            onClick={() => handleEncerrarPrescricao(presc.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Ban size={15} />
                            Encerrar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-gray-500">
              {idosoAtivo
                ? "Nenhuma prescrição cadastrada para este paciente."
                : "Selecione um paciente para visualizar as prescrições."}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-2">
            <Clock3 size={19} className="text-[#1565C0]" />
            <h2 className="text-lg font-semibold text-[#0A2540]">
              Histórico de Doses Registradas
            </h2>
          </div>

          {registrosDose.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {registrosDose.map((dose) => {
                const nomeRemedio =
                  dose.prescricao?.medicamento?.nome || "Medicamento";
                const responsavel = dose.usuario?.nome || "Usuário responsável";

                return (
                  <li
                    key={dose.id}
                    className="flex flex-col justify-between gap-1 rounded-xl border border-gray-100 bg-[#FAFCFE] p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#0A2540]">
                          {nomeRemedio}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            dose.status === "CONFIRMADA"
                              ? "bg-[#E6F4EF] text-[#26A69A]"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {dose.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Registrado por: {responsavel}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-gray-400">
                      {formatarDataHora(dose.data_hora)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Nenhuma confirmação ou ocorrência de dose registrada para este
              paciente ainda.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}