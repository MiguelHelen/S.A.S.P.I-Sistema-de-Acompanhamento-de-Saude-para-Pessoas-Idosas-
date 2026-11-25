"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import { getUsuarioSessao, isAdminPerfil } from "@/lib/clinica";
import {
  HeartPulse,
  Plus,
  Clock3,
  Loader2,
  AlertCircle,
  Cpu,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

interface IndicadorSaudeInfo {
  id?: string;
  nome: string;
  unidade_padrao?: string | null;
  unidade?: string | null;
}

interface UsuarioAutorInfo {
  id?: string;
  nome?: string | null;
}

interface RegistroHistoricoApi {
  id: string;
  idoso_id: string;
  indicador_id: string;
  valor_numerico?: number | string | null;
  valor_categorico?: string | null;
  data_hora: string;
  origem: "MANUAL" | "AUTOMATICO" | string;
  usuario_id?: string | null;
  dispositivo_id?: string | null;
  indicador_saude?: IndicadorSaudeInfo | null;
  usuario?: UsuarioAutorInfo | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

function formatarValor(item: RegistroHistoricoApi): string {
  const base =
    item.valor_categorico && String(item.valor_categorico).trim() !== ""
      ? String(item.valor_categorico)
      : item.valor_numerico !== undefined &&
        item.valor_numerico !== null &&
        String(item.valor_numerico).trim() !== ""
      ? String(item.valor_numerico)
      : "--";

  const unidadeRaw =
    item.indicador_saude?.unidade_padrao || item.indicador_saude?.unidade;
  const unidade = unidadeRaw ? ` ${unidadeRaw}` : "";

  return `${base}${unidade}`;
}

function formatarDataHora(dataHora?: string): string {
  if (!dataHora) return "--";
  const data = new Date(dataHora);
  if (Number.isNaN(data.getTime())) return "--";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoricoPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [perfilUsuario, setPerfilUsuario] = useState<string>("");
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [registros, setRegistros] = useState<RegistroHistoricoApi[]>([]);
  const [filtroOrigem, setFiltroOrigem] = useState<"todos" | "MANUAL" | "AUTOMATICO">("todos");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const sessao = getUsuarioSessao();
    if (!sessao || isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      return;
    }

    setAutorizado(true);
    setPerfilUsuario(sessao.perfil);

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

  const carregarHistorico = useCallback(async (idosoId: string) => {
    const token = localStorage.getItem("saspi_token");
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch(`${API_URL}/registro-saude/idoso/${idosoId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível carregar o histórico clínico.";
        setErro(msg);
        setRegistros([]);
        return;
      }

      setRegistros(Array.isArray(data) ? data : []);
    } catch {
      setErro("Erro de conexão ao consultar o histórico do paciente.");
      setRegistros([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!idosoAtivo?.id || autorizado !== true) {
      setRegistros([]);
      return;
    }
    carregarHistorico(idosoAtivo.id);
  }, [idosoAtivo?.id, autorizado, carregarHistorico]);

  function handleSelectElderly(selectedIdoso: Idoso) {
    setIdosoAtivo(selectedIdoso);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(selectedIdoso));
    window.dispatchEvent(new Event("saspi_elderly_updated"));
  }

  const registrosFiltrados = registros.filter((item) => {
    if (filtroOrigem === "todos") return true;
    return item.origem === filtroOrigem;
  });

  const podeRegistrarManual =
    perfilUsuario !== "FAMILIAR" &&
    perfilUsuario !== "ADMINISTRADOR" &&
    perfilUsuario !== "";

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
            O histórico clínico é destinado aos profissionais assistenciais e
            familiares vinculados ao paciente.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Auditoria e Acompanhamento
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Histórico Clínico
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              {idosoAtivo ? (
                <>
                  Linha do tempo de aferições manuais e automáticas de{" "}
                  <strong className="text-[#0A2540]">{idosoAtivo.nome}</strong>.
                </>
              ) : (
                "Selecione um paciente para consultar os registros de saúde."
              )}
            </p>
          </div>

          {podeRegistrarManual && (
            <Link
              href="/dashboard/historico/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <Plus size={18} />
              Novo Registro Manual
            </Link>
          )}
        </div>

        <div className="mt-6">
          <PatientSelector
            onSelect={handleSelectElderly}
            selectedId={idosoAtivo?.id}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFiltroOrigem("todos")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              filtroOrigem === "todos"
                ? "bg-[#1565C0] text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Clock3 size={16} />
            Todos
          </button>

          <button
            type="button"
            onClick={() => setFiltroOrigem("MANUAL")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              filtroOrigem === "MANUAL"
                ? "bg-[#1565C0] text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <UserCheck size={16} />
            Manuais
          </button>

          <button
            type="button"
            onClick={() => setFiltroOrigem("AUTOMATICO")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              filtroOrigem === "AUTOMATICO"
                ? "bg-[#26A69A] text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Cpu size={16} />
            Automáticos
          </button>
        </div>

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{erro}</span>
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          {carregando ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
              <Loader2 size={18} className="animate-spin text-[#1565C0]" />
              Carregando histórico do paciente...
            </div>
          ) : registrosFiltrados.length > 0 ? (
            <ul className="space-y-4">
              {registrosFiltrados.map((item) => {
                const nomeIndicador =
                  item.indicador_saude?.nome || "Indicador de saúde";
                const valorFormatado = formatarValor(item);
                const isAutomatico = item.origem === "AUTOMATICO";
                const autorLabel =
                  item.usuario?.nome ||
                  (isAutomatico ? "Dispositivo vestível" : "Equipe responsável");

                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-4 rounded-xl border border-gray-100 bg-[#FAFCFE] p-4 transition hover:border-[#BFD8F2] hover:bg-white"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isAutomatico
                          ? "bg-[#E6F4EF] text-[#26A69A]"
                          : "bg-[#E8F1FB] text-[#1565C0]"
                      }`}
                    >
                      <HeartPulse size={22} />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#0A2540]">
                            {nomeIndicador}: {valorFormatado}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isAutomatico
                                ? "bg-[#E6F4EF] text-[#26A69A]"
                                : "bg-[#E8F1FB] text-[#1565C0]"
                            }`}
                          >
                            {isAutomatico ? "Automático" : "Manual"}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          {formatarDataHora(item.data_hora)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        Registrado por: {autorLabel}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm">
                {idosoAtivo
                  ? "Nenhum registro encontrado para o paciente ou filtro selecionado."
                  : "Selecione um paciente para visualizar o histórico."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}