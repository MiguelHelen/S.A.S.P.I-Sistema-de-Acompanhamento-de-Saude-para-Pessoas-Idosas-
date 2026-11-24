"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import { avaliarIndicadorClinico } from "@/lib/clinicalRules";
import {
  API_URL,
  getAuthHeaders,
  getIdosoAtivoSessao,
  getUsuarioSessao,
  isAdminPerfil,
} from "@/lib/clinica";
import {
  FileText,
  Plus,
  HeartPulse,
  Pill,
  Activity,
  Loader2,
  Filter,
  ShieldAlert,
} from "lucide-react";

interface RegistroHistorico {
  id: string;
  tipo: string;
  valor_numerico?: number | null;
  valor_categorico?: string | null;
  data_registro: string;
}

export default function HistoricoPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [carregando, setCarregando] = useState(true);
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

  const carregarHistorico = useCallback(async (pacienteId: string) => {
    setCarregando(true);
    try {
      const res = await fetch(
        `${API_URL}/registro-saude/idoso/${pacienteId}?limit=50`,
        {
          headers: getAuthHeaders(false),
        }
      );

      if (res.ok) {
        const raw = await res.json();
        const lista = Array.isArray(raw) ? raw : raw?.data || [];
        setRegistros(lista);
      } else {
        setRegistros([]);
      }
    } catch {
      setRegistros([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (idosoAtivo?.id && autorizado === true) {
      carregarHistorico(idosoAtivo.id);
    }
  }, [idosoAtivo, autorizado, carregarHistorico]);

  const registrosFiltrados = registros.filter((r) => {
    if (filtro === "TODOS") return true;
    const t = (r.tipo || "").toUpperCase();
    if (filtro === "MEDICACAO") return t === "MEDICACAO";
    if (filtro === "SINAIS")
      return [
        "BATIMENTOS",
        "BPM",
        "SPO2",
        "TEMPERATURA",
        "PRESSAO",
        "GLICEMIA",
      ].includes(t);
    return t === filtro;
  });

  function formatarValor(item: RegistroHistorico) {
    const t = (item.tipo || "").toUpperCase();
    if (t === "BATIMENTOS" || t === "BPM") return `${item.valor_numerico} bpm`;
    if (t === "SPO2") return `${item.valor_numerico}%`;
    if (t === "TEMPERATURA") return `${item.valor_numerico}°C`;
    if (t === "GLICEMIA") return `${item.valor_numerico} mg/dL`;
    return item.valor_categorico || `${item.valor_numerico ?? ""}`;
  }

  const podeCriarRegistro =
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
            O prontuário e histórico clínico são exclusivos para a equipe
            assistencial e familiares vinculados.
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
              Prontuário Digital
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Histórico Clínico
            </h1>
            <p className="mt-2 text-gray-600">
              Linha do tempo completa de sinais vitais, evoluções e doses
              administradas.
            </p>
          </div>

          {podeCriarRegistro && (
            <a
              href="/dashboard/historico/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <Plus size={18} />
              Novo Registro Clínico
            </a>
          )}
        </div>

        <div className="mt-6">
          <PatientSelector
            selectedId={idosoAtivo?.id}
            onSelect={(p) => setIdosoAtivo(p)}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Filter size={14} /> Filtrar:
          </span>
          {[
            { label: "Todos", valor: "TODOS" },
            { label: "Sinais Vitais", valor: "SINAIS" },
            { label: "Medicações", valor: "MEDICACAO" },
            { label: "Evolução Clínica", valor: "EVOLUCAO" },
          ].map((btn) => (
            <button
              key={btn.valor}
              type="button"
              onClick={() => setFiltro(btn.valor)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                filtro === btn.valor
                  ? "bg-[#1565C0] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:text-[#0A2540]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {carregando ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <Loader2 size={24} className="animate-spin text-[#1565C0]" />
              <span className="ml-2">Carregando prontuário...</span>
            </div>
          ) : registrosFiltrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
              <FileText size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 font-semibold text-[#0A2540]">
                Nenhum registro encontrado neste filtro
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Selecione outro filtro ou adicione um novo registro clínico.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {registrosFiltrados.map((item) => {
                const tipoUpper = (item.tipo || "").toUpperCase();
                const isMed = tipoUpper === "MEDICACAO";
                const isSinal = [
                  "BATIMENTOS",
                  "BPM",
                  "SPO2",
                  "TEMPERATURA",
                  "PRESSAO",
                  "GLICEMIA",
                ].includes(tipoUpper);

                const valorParaAvaliacao =
                  item.valor_numerico != null
                    ? item.valor_numerico
                    : item.valor_categorico || "";

                const tagAvaliacao = isSinal
                  ? avaliarIndicadorClinico(tipoUpper, valorParaAvaliacao)
                  : null;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isMed
                            ? "bg-teal-50 text-teal-600"
                            : isSinal
                            ? "bg-rose-50 text-rose-600"
                            : "bg-blue-50 text-[#1565C0]"
                        }`}
                      >
                        {isMed ? (
                          <Pill size={18} />
                        ) : isSinal ? (
                          <HeartPulse size={18} />
                        ) : (
                          <Activity size={18} />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            {tipoUpper}
                          </span>
                          {tagAvaliacao && (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tagAvaliacao.corBadge}`}
                            >
                              {tagAvaliacao.rotulo}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-[#0A2540]">
                          {formatarValor(item)}
                        </p>
                        {item.valor_numerico != null &&
                          item.valor_categorico && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              Obs.: {item.valor_categorico}
                            </p>
                          )}
                      </div>
                    </div>

                    <span className="text-xs text-gray-400 sm:text-right">
                      {new Date(item.data_registro).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}