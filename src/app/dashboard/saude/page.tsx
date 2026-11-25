"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import MetricCard, { avaliarIndicadorClinico } from "@/components/MetricCard";
import {
  HeartPulse,
  Activity,
  Thermometer,
  Droplet,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface RegistroSaudeItem {
  id: string;
  idoso_id: string;
  valor_numerico?: number | string | null;
  valor_categorico?: string | null;
  data_hora: string;
  origem: string;
  indicador_saude?: {
    nome?: string | null;
    unidade_padrao?: string | null;
    unidade?: string | null;
  } | null;
  usuario?: {
    nome?: string | null;
  } | null;
}

interface AlertaSaudePayload {
  idoso_id?: string;
  mensagem?: string;
  indicador?: string;
  valor?: string | number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

function normalizar(texto?: string | null): string {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function extrairValorTexto(item: RegistroSaudeItem): string {
  if (item.valor_categorico && String(item.valor_categorico).trim() !== "") {
    return String(item.valor_categorico);
  }
  if (
    item.valor_numerico !== undefined &&
    item.valor_numerico !== null &&
    String(item.valor_numerico).trim() !== ""
  ) {
    return String(item.valor_numerico);
  }
  return "--";
}

function formatarDataHora(dataHora?: string): string {
  if (!dataHora) return "--";
  const d = new Date(dataHora);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SaudePage() {
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [registros, setRegistros] = useState<RegistroSaudeItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [alertaAtivo, setAlertaAtivo] = useState<AlertaSaudePayload | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("saspi_active_elderly");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setIdosoAtivo(parsed);
        }
      } catch {
        // Ignora JSON inválido
      }
    }
  }, []);

  const carregarRegistros = useCallback(async (idosoId: string) => {
    const token = localStorage.getItem("saspi_token");
    setCarregando(true);

    try {
      const res = await fetch(`${API_URL}/registro-saude/idoso/${idosoId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        setRegistros([]);
        return;
      }

      const data = await res.json();
      setRegistros(Array.isArray(data) ? data : []);
    } catch {
      setRegistros([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!idosoAtivo?.id) {
      setRegistros([]);
      setAlertaAtivo(null);
      return;
    }

    setAlertaAtivo(null);
    carregarRegistros(idosoAtivo.id);

    const token = localStorage.getItem("saspi_token");
    const socket: Socket = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
      query: { idosoId: idosoAtivo.id },
    });

    socket.on("connect", () => {
      socket.emit("entrar-sala-idoso", idosoAtivo.id);
    });
    socket.emit("entrar-sala-idoso", idosoAtivo.id);

    socket.on("novo-registro-saude", (novo: RegistroSaudeItem) => {
      if (novo?.idoso_id && novo.idoso_id !== idosoAtivo.id) return;
      setRegistros((prev) => {
        if (novo?.id && prev.some((r) => r.id === novo.id)) return prev;
        return [novo, ...prev];
      });
    });

    socket.on("alerta-saude", (payload: AlertaSaudePayload) => {
      if (payload?.idoso_id && payload.idoso_id !== idosoAtivo.id) return;
      setAlertaAtivo(payload);
      window.dispatchEvent(new Event("saspi_alerta_clinico"));
    });

    return () => {
      socket.disconnect();
    };
  }, [idosoAtivo?.id, carregarRegistros]);

  function handleSelectIdoso(selecionado: Idoso) {
    setIdosoAtivo(selecionado);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(selecionado));
    window.dispatchEvent(new Event("saspi_elderly_updated"));
  }

  const ultimoPorPredicado = (predicado: (nomeNorm: string) => boolean): string => {
    const encontrado = registros.find((item) =>
      predicado(normalizar(item.indicador_saude?.nome))
    );
    return encontrado ? extrairValorTexto(encontrado) : "--";
  };

  const valorFc = ultimoPorPredicado(
    (n) => n.includes("frequencia") || n.includes("cardiaca") || n.includes("fc")
  );
  const valorSpo2 = ultimoPorPredicado(
    (n) => n.includes("saturacao") || n.includes("oxigenacao") || n.includes("spo2")
  );
  const valorTemp = ultimoPorPredicado(
    (n) => n.includes("temperatura") || n.includes("termica")
  );
  const valorPa = ultimoPorPredicado(
    (n) => n.includes("pressao") || n.includes("arterial") || n.includes("pa")
  );

  const avFc = avaliarIndicadorClinico("fc", valorFc);
  const avSpo2 = avaliarIndicadorClinico("spo2", valorSpo2);
  const avTemp = avaliarIndicadorClinico("temp", valorTemp);
  const avPa = avaliarIndicadorClinico("pa", valorPa);

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Telemetria & Monitoramento
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Sinais Vitais
          </h1>
          <p className="mt-2 text-gray-600">
            {idosoAtivo
              ? `Aferições e histórico fisiológico de ${idosoAtivo.nome}.`
              : "Selecione um paciente para visualizar os dados vitais."}
          </p>
        </div>

        {alertaAtivo && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} className="shrink-0 text-red-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Alerta Clínico em Tempo Real
                </p>
                <p className="text-sm font-semibold">
                  {alertaAtivo.mensagem ||
                    `Alteração crítica detectada em ${
                      alertaAtivo.indicador || "indicador vital"
                    }: ${alertaAtivo.valor ?? ""}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAlertaAtivo(null)}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              Dispensar
            </button>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <PatientSelector
            onSelect={handleSelectIdoso}
            selectedId={idosoAtivo?.id}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Frequência Cardíaca"
              value={valorFc}
              unit="bpm"
              icon={<HeartPulse size={22} />}
              statusLabel={avFc.label}
              statusTone={avFc.tone}
            />
            <MetricCard
              title="Saturação (SpO2)"
              value={valorSpo2}
              unit="%"
              icon={<Activity size={22} />}
              statusLabel={avSpo2.label}
              statusTone={avSpo2.tone}
            />
            <MetricCard
              title="Temperatura"
              value={valorTemp}
              unit="°C"
              icon={<Thermometer size={22} />}
              statusLabel={avTemp.label}
              statusTone={avTemp.tone}
            />
            <MetricCard
              title="Pressão Arterial"
              value={valorPa === "--" ? "--/--" : valorPa}
              unit="mmHg"
              icon={<Droplet size={22} />}
              statusLabel={avPa.label}
              statusTone={avPa.tone}
            />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0A2540]">
              Últimas Aferições Registradas
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Registros gerados por dispositivos vestíveis ou lançamentos manuais
              da equipe.
            </p>

            {carregando ? (
              <div className="mt-8 flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <Loader2 size={18} className="animate-spin text-[#1565C0]" />
                Carregando aferições...
              </div>
            ) : registros.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {registros.slice(0, 10).map((item) => {
                  const nomeInd =
                    item.indicador_saude?.nome || "Indicador de saúde";
                  const unidadeRaw =
                    item.indicador_saude?.unidade_padrao ||
                    item.indicador_saude?.unidade;
                  const unid = unidadeRaw ? ` ${unidadeRaw}` : "";
                  return (
                    <li
                      key={item.id}
                      className="flex flex-col justify-between gap-1 rounded-xl border border-gray-100 bg-[#FAFCFE] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold text-[#0A2540]">
                          {nomeInd}: {extrairValorTexto(item)}
                          {unid}
                        </p>
                        <p className="text-xs text-gray-500">
                          Origem: {item.origem}
                          {item.usuario?.nome ? ` • Por: ${item.usuario.nome}` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-400">
                        {formatarDataHora(item.data_hora)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                <Clock size={36} className="text-gray-300" />
                <h3 className="mt-4 font-semibold text-[#0A2540]">
                  Sem aferições para este paciente
                </h3>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  Assim que o dispositivo transmitir os dados ou for realizado um
                  registro clínico, os índices aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}