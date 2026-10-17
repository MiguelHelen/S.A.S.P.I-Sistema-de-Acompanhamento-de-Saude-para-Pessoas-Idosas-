"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import MetricCard from "@/components/MetricCard";
import HealthChart, { PontoGraficoSaude } from "@/components/HealthChart";
import {
  HeartPulse,
  Activity,
  Thermometer,
  Droplet,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function SaudePage() {
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState("");
  const [metricas, setMetricas] = useState({
    fc: "--",
    spo2: "--",
    temp: "--",
    pa: "--/--",
  });
  const [pontosGrafico, setPontosGrafico] = useState<PontoGraficoSaude[]>([]);

  const carregarSinaisVitais = useCallback(async (idosoId: string) => {
    setCarregando(true);
    const token = localStorage.getItem("saspi_token");
    const headers = { ...(token && { Authorization: `Bearer ${token}` }) };

    try {
      let res = await fetch(`${API_URL}/registro-saude/idoso/${idosoId}`, {
        headers,
      });

      if (!res.ok) {
        res = await fetch(`${API_URL}/registro-saude?idoso_id=${idosoId}`, {
          headers,
        });
      }

      if (res.ok) {
        const data = await res.json();
        const lista = (Array.isArray(data) ? data : data.data || []).filter(
          (r: any) => !r.idoso_id || r.idoso_id === idosoId
        );

        let fc = "--";
        let spo2 = "--";
        let temp = "--";
        let pa = "--/--";
        const serieFc: PontoGraficoSaude[] = [];

        lista.forEach((r: any) => {
          const nomeInd = String(
            r.indicador_saude?.nome || r.indicador_nome || ""
          ).toLowerCase();
          const valBruto =
            r.valor_numerico ?? r.valor_categorico ?? r.valor ?? "--";

          if (nomeInd.includes("card")) {
            if (fc === "--") fc = String(valBruto);
            const num = Number(r.valor_numerico ?? r.valor);
            if (!Number.isNaN(num)) {
              const dt = r.data_hora || r.created_at;
              const hora = dt
                ? new Date(dt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recente";
              serieFc.push({ horario: hora, valor: num });
            }
          } else if (nomeInd.includes("oxig") || nomeInd.includes("spo")) {
            if (spo2 === "--") spo2 = String(valBruto);
          } else if (nomeInd.includes("temp")) {
            if (temp === "--") temp = String(valBruto);
          } else if (nomeInd.includes("press")) {
            if (pa === "--/--") pa = String(valBruto);
          }
        });

        setMetricas({ fc, spo2, temp, pa });
        setPontosGrafico(serieFc.reverse());
      } else {
        setMetricas({ fc: "--", spo2: "--", temp: "--", pa: "--/--" });
        setPontosGrafico([]);
      }
    } catch {
      setMetricas({ fc: "--", spo2: "--", temp: "--", pa: "--/--" });
      setPontosGrafico([]);
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
          carregarSinaisVitais(parsed.id);
        }
      } catch {}
    }
  }, [carregarSinaisVitais]);

  function handleSelectPatient(idoso: Idoso) {
    setIdosoAtivo(idoso);
    if (idoso?.id) {
      carregarSinaisVitais(idoso.id);
    }
  }

  const podeRegistrar = perfilUsuario !== "FAMILIAR";

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

          {podeRegistrar && (
            <Link
              href="/dashboard/historico/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <Plus size={18} />
              Nova aferição
            </Link>
          )}
        </div>

        <div className="mt-8 space-y-6">
          <PatientSelector
            onSelect={handleSelectPatient}
            selectedId={idosoAtivo?.id}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Frequência Cardíaca"
              value={metricas.fc}
              unit="bpm"
              icon={<HeartPulse size={22} />}
            />
            <MetricCard
              title="Saturação (SpO2)"
              value={metricas.spo2}
              unit="%"
              icon={<Activity size={22} />}
            />
            <MetricCard
              title="Temperatura"
              value={metricas.temp}
              unit="°C"
              icon={<Thermometer size={22} />}
            />
            <MetricCard
              title="Pressão Arterial"
              value={metricas.pa}
              unit="mmHg"
              icon={<Droplet size={22} />}
            />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0A2540]">
              Curva de Evolução Cardíaca
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Registros gerados por dispositivos vestíveis ou lançamentos
              manuais da equipe.
            </p>

            {carregando ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                <Loader2 size={24} className="animate-spin text-[#1565C0]" />
                <span className="ml-2">
                  Sincronizando aferições fisiológicas...
                </span>
              </div>
            ) : pontosGrafico.length > 0 ? (
              <div className="mt-6">
                <HealthChart dados={pontosGrafico} />
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                <Clock size={36} className="text-gray-300" />
                <h3 className="mt-4 font-semibold text-[#0A2540]">
                  Sem curva de telemetria para este paciente
                </h3>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  Assim que a smartband transmitir os dados ou for realizado um
                  registro clínico, o gráfico aparecerá aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}