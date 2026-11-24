"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ComponentProps,
} from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import HealthChart from "@/components/HealthChart";

type PontoGrafico = NonNullable<
  ComponentProps<typeof HealthChart>["dados"]
>[number];
import { avaliarIndicadorClinico } from "@/lib/clinicalRules";
import {
  API_URL,
  getAuthHeaders,
  getIdosoAtivoSessao,
  getUsuarioSessao,
  isAdminPerfil,
} from "@/lib/clinica";
import { io, Socket } from "socket.io-client";
import {
  HeartPulse,
  Wind,
  Thermometer,
  Activity,
  Plus,
  CheckCircle2,
  Loader2,
  Wifi,
  WifiOff,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

interface MetricasAtuais {
  bpm: string;
  spo2: string;
  temperatura: string;
  pressao: string;
  ultimaAtualizacao: string;
}

export default function SaudePage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [userPerfil, setUserPerfil] = useState<string>("");
  const [metricas, setMetricas] = useState<MetricasAtuais>({
    bpm: "--",
    spo2: "--",
    temperatura: "--",
    pressao: "--",
    ultimaAtualizacao: "Aguardando dados...",
  });
  const [pontosGrafico, setPontosGrafico] = useState<PontoGrafico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [socketConectado, setSocketConectado] = useState(false);
  const [alertaEmergencia, setAlertaEmergencia] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

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

  const carregarTelemetria = useCallback(async (pacienteId: string) => {
    setCarregando(true);
    try {
      const res = await fetch(
        `${API_URL}/registro-saude/idoso/${pacienteId}?limit=20`,
        {
          headers: getAuthHeaders(false),
        },
      );

      if (res.ok) {
        const raw = await res.json();
        const lista = Array.isArray(raw) ? raw : raw?.data || [];

        const ultimos: MetricasAtuais = {
          bpm: "--",
          spo2: "--",
          temperatura: "--",
          pressao: "--",
          ultimaAtualizacao:
            lista.length > 0
              ? new Date(lista[0].data_registro).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Sem registros",
        };

        const pontos: PontoGrafico[] = [];

        for (let i = lista.length - 1; i >= 0; i--) {
          const item = lista[i];
          const tipo = (item.tipo || "").toUpperCase();

          if (tipo === "BATIMENTOS" || tipo === "BPM") {
            const val = Number(item.valor_numerico);
            if (!Number.isNaN(val)) {
              ultimos.bpm = `${val} bpm`;
              const horaFmt = new Date(item.data_registro).toLocaleTimeString(
                "pt-BR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );
              pontos.push({
                horario: horaFmt,
                valor: val,
              } as PontoGrafico);
            }
          } else if (tipo === "SPO2" || tipo === "OXIGENACAO") {
            if (item.valor_numerico != null) {
              ultimos.spo2 = `${item.valor_numerico}%`;
            }
          } else if (tipo === "TEMPERATURA") {
            if (item.valor_numerico != null) {
              ultimos.temperatura = `${item.valor_numerico}°C`;
            }
          } else if (tipo === "PRESSAO") {
            ultimos.pressao =
              item.valor_categorico || `${item.valor_numerico} mmHg`;
          }
        }

        setMetricas(ultimos);
        setPontosGrafico(pontos.slice(-12));
      }
    } catch {
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!idosoAtivo?.id || autorizado !== true) return;

    carregarTelemetria(idosoAtivo.id);

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const wsUrl = API_URL.replace(/^http/, "ws");
    const socket = io(wsUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setSocketConectado(true);
      socket.emit("join-idoso", { idosoId: idosoAtivo.id });
    });

    socket.on("disconnect", () => {
      setSocketConectado(false);
    });

    socket.on("novo-registro-saude", (payload: any) => {
      if (payload?.idoso_id !== idosoAtivo.id) return;

      const tipo = (payload.tipo || "").toUpperCase();
      const agora = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      let novoBpm: number | null = null;

      if (
        (tipo === "BATIMENTOS" || tipo === "BPM") &&
        payload.valor_numerico != null
      ) {
        const val = Number(payload.valor_numerico);
        if (!Number.isNaN(val)) {
          novoBpm = val;
        }
      }

      setMetricas((prev) => {
        const next = { ...prev, ultimaAtualizacao: `Agora (${agora})` };
        if (novoBpm !== null) {
          next.bpm = `${novoBpm} bpm`;
        } else if (tipo === "SPO2" || tipo === "OXIGENACAO") {
          next.spo2 = `${payload.valor_numerico}%`;
        } else if (tipo === "TEMPERATURA") {
          next.temperatura = `${payload.valor_numerico}°C`;
        } else if (tipo === "PRESSAO") {
          next.pressao =
            payload.valor_categorico || `${payload.valor_numerico} mmHg`;
        }
        return next;
      });

      if (novoBpm !== null) {
        setPontosGrafico((g) => [
          ...g.slice(-11),
          { horario: agora, valor: novoBpm },
        ]);
      }

      const avaliacao = avaliarIndicadorClinico(
        tipo,
        payload.valor_numerico ?? payload.valor_categorico,
      );
      if (avaliacao.status === "alerta") {
        setAlertaEmergencia(
          `Alerta Fisiológico: ${tipo} em ${
            payload.valor_numerico ?? payload.valor_categorico
          } (${avaliacao.rotulo})`,
        );
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [idosoAtivo, autorizado, carregarTelemetria]);

  const evalBpm = avaliarIndicadorClinico("BATIMENTOS", metricas.bpm);
  const evalSpo2 = avaliarIndicadorClinico("SPO2", metricas.spo2);
  const evalTemp = avaliarIndicadorClinico("TEMPERATURA", metricas.temperatura);
  const evalPressao = avaliarIndicadorClinico("PRESSAO", metricas.pressao);

  const podeAferir =
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
            O módulo de telemetria e sinais vitais é destinado à equipe clínica
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
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
                Telemetria & Sinais Vitais
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  socketConectado
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {socketConectado ? <Wifi size={12} /> : <WifiOff size={12} />}
                {socketConectado ? "Tempo Real Ativo" : "Standby"}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Saúde do Paciente
            </h1>
            <p className="mt-2 text-gray-600">
              Leituras fisiológicas contínuas captadas pela smartband e
              registros manuais.
            </p>
          </div>

          {podeAferir && (
            <a
              href="/dashboard/historico/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <Plus size={18} />
              Registrar Aferição Manual
            </a>
          )}
        </div>

        <div className="mt-6">
          <PatientSelector
            selectedId={idosoAtivo?.id}
            onSelect={(p) => setIdosoAtivo(p)}
          />
        </div>

        {alertaEmergencia && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} className="shrink-0 text-red-600" />
              <p className="text-sm font-semibold">{alertaEmergencia}</p>
            </div>
            <button
              type="button"
              onClick={() => setAlertaEmergencia(null)}
              className="text-xs font-medium underline hover:text-red-950"
            >
              Dispensar
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle2 size={14} className="text-[#26A69A]" />
          <span>Última atualização: {metricas.ultimaAtualizacao}</span>
        </div>

        {carregando ? (
          <div className="mt-10 flex items-center justify-center py-12 text-gray-500">
            <Loader2 size={24} className="animate-spin text-[#1565C0]" />
            <span className="ml-2 text-sm">Sincronizando sinais vitais...</span>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <HeartPulse size={22} />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${evalBpm.corBadge}`}
                  >
                    {evalBpm.rotulo}
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium text-gray-500">
                  Frequência Cardíaca
                </p>
                <p className="mt-1 text-3xl font-bold text-[#0A2540]">
                  {metricas.bpm}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Wind size={22} />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${evalSpo2.corBadge}`}
                  >
                    {evalSpo2.rotulo}
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium text-gray-500">
                  Oxigenação (SpO₂)
                </p>
                <p className="mt-1 text-3xl font-bold text-[#0A2540]">
                  {metricas.spo2}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Thermometer size={22} />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${evalTemp.corBadge}`}
                  >
                    {evalTemp.rotulo}
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium text-gray-500">
                  Temperatura Corporal
                </p>
                <p className="mt-1 text-3xl font-bold text-[#0A2540]">
                  {metricas.temperatura}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Activity size={22} />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${evalPressao.corBadge}`}
                  >
                    {evalPressao.rotulo}
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium text-gray-500">
                  Pressão Arterial
                </p>
                <p className="mt-1 text-3xl font-bold text-[#0A2540]">
                  {metricas.pressao}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-base font-semibold text-[#0A2540]">
                Curva de Frequência Cardíaca — {idosoAtivo?.nome || "Paciente"}
              </h2>
              <HealthChart dados={pontosGrafico} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
