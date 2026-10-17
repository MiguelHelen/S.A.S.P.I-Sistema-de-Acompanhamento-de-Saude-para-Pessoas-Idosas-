"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import MetricCard from "@/components/MetricCard";
import { HeartPulse, Activity, Thermometer, Droplet, Clock } from "lucide-react";

export default function SaudePage() {
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("saspi_active_elderly");
    if (saved) {
      try {
        setIdosoAtivo(JSON.parse(saved));
      } catch {}
    }
  }, []);

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

        <div className="mt-8 space-y-6">
          <PatientSelector
            onSelect={(idoso) => setIdosoAtivo(idoso)}
            selectedId={idosoAtivo?.id}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Frequência Cardíaca"
              value="--"
              unit="bpm"
              icon={<HeartPulse size={22} />}
            />
            <MetricCard
              title="Saturação (SpO2)"
              value="--"
              unit="%"
              icon={<Activity size={22} />}
            />
            <MetricCard
              title="Temperatura"
              value="--"
              unit="°C"
              icon={<Thermometer size={22} />}
            />
            <MetricCard
              title="Pressão Arterial"
              value="--/--"
              unit="mmHg"
              icon={<Droplet size={22} />}
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

            <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
              <Clock size={36} className="text-gray-300" />
              <h3 className="mt-4 font-semibold text-[#0A2540]">
                Sem aferições para este paciente
              </h3>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Assim que a smartband transmitir os dados ou for realizado um
                registro clínico, os índices aparecerão aqui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}