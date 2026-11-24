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
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,
  Check,
  Eye,
  ShieldAlert,
} from "lucide-react";

interface Prescricao {
  id: string;
  dosagem: string;
  frequencia: string;
  horarios?: string;
  ativo: boolean;
  data_inicio: string;
  data_fim?: string;
  medicamento?: {
    id: string;
    nome: string;
    descricao?: string;
  };
  medico?: {
    nome: string;
  };
}

export default function MedicamentosPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [dosesTomadasHoje, setDosesTomadasHoje] = useState<
    Record<string, boolean>
  >({});
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
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

  const carregarPrescricoes = useCallback(async (pacienteId: string) => {
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/prescricao/idoso/${pacienteId}`, {
        headers: getAuthHeaders(false),
      });

      if (res.ok) {
        const raw = await res.json();
        const lista = Array.isArray(raw) ? raw : raw?.data || [];
        setPrescricoes(lista);
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
    if (idosoAtivo?.id && autorizado === true) {
      carregarPrescricoes(idosoAtivo.id);
    }
  }, [idosoAtivo, autorizado, carregarPrescricoes]);

  async function registrarToma(prescricao: Prescricao) {
    if (!idosoAtivo) return;
    setSalvandoId(prescricao.id);
    setMensagem("");

    try {
      const res = await fetch(`${API_URL}/registro-saude`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          idoso_id: idosoAtivo.id,
          tipo: "MEDICACAO",
          valor_categorico: `Dose administrada: ${
            prescricao.medicamento?.nome || "Medicamento"
          } (${prescricao.dosagem})`,
          data_registro: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setDosesTomadasHoje((prev) => ({ ...prev, [prescricao.id]: true }));
        setMensagem(
          `Administração de ${prescricao.medicamento?.nome} registrada com sucesso!`
        );
        setTimeout(() => setMensagem(""), 4000);
      }
    } catch {
      // Falha silenciosa
    } finally {
      setSalvandoId(null);
    }
  }

  async function encerrarPrescricao(prescricao: Prescricao) {
    const confirmou = window.confirm(
      `Deseja encerrar a prescrição de ${
        prescricao.medicamento?.nome || "este medicamento"
      }?`
    );
    if (!confirmou) return;

    setSalvandoId(prescricao.id);
    try {
      const res = await fetch(`${API_URL}/prescricao/${prescricao.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ ativo: false }),
      });

      if (res.ok) {
        setPrescricoes((prev) =>
          prev.map((p) => (p.id === prescricao.id ? { ...p, ativo: false } : p))
        );
        setMensagem("Prescrição encerrada com sucesso.");
        setTimeout(() => setMensagem(""), 3000);
      }
    } catch {
      // Falha silenciosa
    } finally {
      setSalvandoId(null);
    }
  }

  const podePrescrever = userPerfil === "MEDICO";
  const podeConfirmarDose =
    userPerfil !== "ADMINISTRADOR" && userPerfil !== "FAMILIAR";

  const ativas = prescricoes.filter((p) => p.ativo !== false);
  const encerradas = prescricoes.filter((p) => p.ativo === false);

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
            O módulo de medicamentos e prescrições é exclusivo para a equipe
            clínica e familiares vinculados.
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
              Farmacoterapia & Adesão
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Medicamentos & Prescrições
            </h1>
            <p className="mt-2 text-gray-600">
              Controle de posologia, horários de administração e confirmação de
              doses.
            </p>
          </div>

          {podePrescrever && (
            <a
              href="/dashboard/medicamentos/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <Plus size={18} />
              Nova Prescrição
            </a>
          )}
        </div>

        <div className="mt-6">
          <PatientSelector
            selectedId={idosoAtivo?.id}
            onSelect={(p) => setIdosoAtivo(p)}
          />
        </div>

        {userPerfil === "FAMILIAR" && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <Eye size={18} className="shrink-0 text-amber-600" />
            <p className="text-xs sm:text-sm">
              <strong>Modo Acompanhamento Familiar:</strong> Você visualiza as
              prescrições ativas do paciente. O registro de administração de
              doses e novas prescrições são realizados pela equipe clínica.
            </p>
          </div>
        )}

        {mensagem && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{mensagem}</p>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Pill size={20} className="text-[#1565C0]" />
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Prescrições Ativas ({ativas.length})
              </h2>
            </div>
          </div>

          <div className="mt-6">
            {carregando ? (
              <div className="flex items-center justify-center py-10 text-sm text-gray-500">
                <Loader2 size={22} className="animate-spin text-[#1565C0]" />
                <span className="ml-2">Carregando prescrições...</span>
              </div>
            ) : ativas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
                <AlertCircle size={32} className="mx-auto text-gray-300" />
                <p className="mt-3 font-medium text-[#0A2540]">
                  Nenhuma prescrição ativa para este paciente
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {podePrescrever
                    ? "Clique em 'Nova Prescrição' para iniciar o plano terapêutico."
                    : "Nenhuma medicação prescrita no momento."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {ativas.map((p) => {
                  const tomado = Boolean(dosesTomadasHoje[p.id]);
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col justify-between rounded-xl border border-gray-100 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-bold text-[#0A2540]">
                              {p.medicamento?.nome || "Medicamento"}
                            </h3>
                            <span className="mt-1 inline-block rounded-md bg-[#E8F1FB] px-2.5 py-0.5 text-xs font-semibold text-[#1565C0]">
                              {p.dosagem}
                            </span>
                          </div>

                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Ativo
                          </span>
                        </div>

                        <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <Clock size={14} className="text-[#26A69A]" />
                            <span>
                              <strong>Frequência:</strong> {p.frequencia}
                            </span>
                          </p>
                          {p.horarios && (
                            <p className="text-xs text-gray-500">
                              Horários programados: {p.horarios}
                            </p>
                          )}
                          {p.medicamento?.descricao && (
                            <p className="mt-2 rounded-lg bg-white p-2.5 text-xs text-gray-500 border border-gray-100">
                              {p.medicamento.descricao}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
                        {podeConfirmarDose ? (
                          <button
                            type="button"
                            disabled={tomado || salvandoId === p.id}
                            onClick={() => registrarToma(p)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                              tomado
                                ? "bg-emerald-50 text-emerald-700 cursor-default"
                                : "bg-[#26A69A] text-white hover:bg-[#1f8a80]"
                            }`}
                          >
                            {salvandoId === p.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : tomado ? (
                              <Check size={14} />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            {tomado ? "Dose Confirmada" : "Confirmar Dose"}
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">
                            Somente visualização
                          </span>
                        )}

                        {podePrescrever && (
                          <button
                            type="button"
                            disabled={salvandoId === p.id}
                            onClick={() => encerrarPrescricao(p)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <XCircle size={14} />
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

        {encerradas.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-500">
              Prescrições Encerradas ({encerradas.length})
            </h2>
            <div className="mt-4 divide-y divide-gray-100">
              {encerradas.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-3 text-sm text-gray-500"
                >
                  <div>
                    <span className="font-medium text-gray-700">
                      {p.medicamento?.nome || "Medicamento"}
                    </span>{" "}
                    — {p.dosagem} ({p.frequencia})
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs">
                    Encerrado
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}