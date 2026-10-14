"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import HealthChart from "@/components/HealthChart";
import Link from "next/link";
import {
  HeartPulse,
  Activity,
  Gauge,
  TrendingUp,
  Plus,
  Loader2,
} from "lucide-react";

export default function SinaisVitaisPage() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [idoso, setIdoso] = useState<Idoso>({
    id: "1",
    nome: "Dona Francisca Silva",
    idade: 78,
    quarto: "Quarto 102",
  });

  useEffect(() => {
    // 1. Validação de autenticação
    const token = localStorage.getItem("saspi_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setAutenticado(true);

    // 2. Carrega o idoso que foi previamente selecionado no dashboard
    const savedElderly = localStorage.getItem("saspi_active_elderly");
    if (savedElderly) {
      try {
        setIdoso(JSON.parse(savedElderly));
      } catch (e) {
        console.error("Erro ao ler idoso ativo:", e);
      }
    }
  }, [router]);

  // Atualiza o idoso ativo no estado e no localStorage
  function handleSelectIdoso(novoIdoso: Idoso) {
    setIdoso(novoIdoso);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(novoIdoso));
  }

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="animate-spin text-[#1565C0]" size={36} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Acompanhamento clínico contínuo
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Sinais Vitais e Indicadores
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Registros e monitoramento contínuo da saúde de{" "}
              <strong className="text-[#0A2540]">{idoso.nome}</strong>.
            </p>
          </div>

          <Link
            href="/dashboard/historico/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={18} />
            Novo Registro
          </Link>
        </div>

        {/* Seletor de Idoso integrado no topo */}
        <div className="mt-6">
          <PatientSelector
            onSelect={handleSelectIdoso}
            selectedId={idoso.id}
          />
        </div>

        {/* Cards de Indicadores com dados reativos por idoso */}
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {/* Card 1: Frequência Cardíaca */}
          <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <HeartPulse size={24} />
              </div>
              <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                Estável
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-gray-600">
              Frequência cardíaca
            </p>

            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-[#0A2540]">
                {idoso.id === "1" ? "74" : idoso.id === "2" ? "82" : "68"}
              </span>
              <span className="ml-2 text-sm font-medium text-gray-500">bpm</span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Paciente: {idoso.nome}
            </p>
          </article>

          {/* Card 2: Oxigenação */}
          <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                <Activity size={24} />
              </div>
              <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                Normal
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-gray-600">
              Oxigenação (SpO2)
            </p>

            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-[#0A2540]">
                {idoso.id === "1" ? "98" : idoso.id === "2" ? "95" : "97"}
              </span>
              <span className="ml-1 text-sm font-medium text-gray-500">%</span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Última aferição: recente
            </p>
          </article>

          {/* Card 3: Pressão Arterial */}
          <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Gauge size={24} />
              </div>
              <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                Controlada
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-gray-600">
              Pressão arterial
            </p>

            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-[#0A2540]">
                {idoso.id === "1" ? "120/80" : idoso.id === "2" ? "130/85" : "118/75"}
              </span>
              <span className="ml-2 text-sm font-medium text-gray-500">mmHg</span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Rotina de monitoramento
            </p>
          </article>
        </section>

        {/* Seção Gráfica com HealthChart */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-[#26A69A]" />
                <h2 className="text-xl font-semibold text-[#0A2540]">
                  Evolução dos Indicadores — {idoso.nome}
                </h2>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Acompanhe a variação temporal dos sinais vitais deste paciente.
              </p>
            </div>

            <select
              aria-label="Selecionar indicador"
              className="rounded-xl border border-gray-200 bg-[#FAFCFE] px-4 py-2.5 text-sm font-medium text-[#0A2540] outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
              defaultValue="frequencia"
            >
              <option value="frequencia">Frequência cardíaca</option>
              <option value="oxigenacao">Oxigenação</option>
              <option value="pressao">Pressão arterial</option>
            </select>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-[#F8FAFC] p-4 md:p-6">
            <HealthChart />
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Dados clínicos integrados com o sistema S.A.S.P.I.
          </p>
        </section>
      </div>
    </main>
  );
}