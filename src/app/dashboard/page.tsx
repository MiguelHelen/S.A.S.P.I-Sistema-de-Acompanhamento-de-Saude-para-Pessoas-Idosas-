"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import MetricCard from "@/components/MetricCard";
import InfoCard from "@/components/InfoCard";

export default function Dashboard() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("saspi_token");
    const userRaw = localStorage.getItem("saspi_user");

    if (!token) {
      router.push("/login");
    } else {
      setAutenticado(true);
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          // Pega apenas o primeiro nome para a saudação
          setNomeUsuario(user.nome ? user.nome.split(" ")[0] : "Usuário");
        } catch {
          setNomeUsuario("Usuário");
        }
      }
    }
  }, [router]);

  // Evita piscar a tela com dados vazios antes de validar o token
  if (!autenticado) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
          Olá, {nomeUsuario}!
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Acompanhe as principais informações de saúde.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Frequência cardíaca" value="72" unit="bpm" icon={undefined} />
          <MetricCard title="Oxigenação" value="97" unit="%" icon={undefined} />
          <InfoCard
            label="Próximo medicamento"
            title="Losartana"
            subtitle="Hoje às 20:00" icon={undefined}          />
          <InfoCard
            label="Próxima consulta"
            title="Cardiologista"
            subtitle="05/09 às 14:00" icon={undefined}          />
        </div>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Histórico recente
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Últimos registros de saúde
              </p>
            </div>

            <a
              href="/dashboard/historico"
              className="text-sm font-medium text-[#1565C0] hover:underline"
            >
              Ver histórico
            </a>
          </div>

          <div className="mt-6 divide-y divide-gray-100">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-[#0A2540]">Frequência cardíaca</p>
                <p className="mt-1 text-sm text-gray-500">Hoje, 16:30</p>
              </div>
              <p className="font-semibold text-[#0A2540]">72 bpm</p>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-[#0A2540]">Oxigenação</p>
                <p className="mt-1 text-sm text-gray-500">Hoje, 15:45</p>
              </div>
              <p className="font-semibold text-[#0A2540]">97%</p>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-[#0A2540]">Pressão arterial</p>
                <p className="mt-1 text-sm text-gray-500">Ontem, 20:10</p>
              </div>
              <p className="font-semibold text-[#0A2540]">120/80 mmHg</p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div>
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Evolução da frequência cardíaca
              </h2>
              <p className="mt-1 text-sm text-gray-500">Registros recentes</p>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-[#F8FAFC] p-6">
              <div className="flex min-h-52 items-end gap-3">
                <div className="h-20 flex-1 rounded-t-lg bg-[#DCEAF8]"></div>
                <div className="h-28 flex-1 rounded-t-lg bg-[#BFD8F2]"></div>
                <div className="h-24 flex-1 rounded-t-lg bg-[#9FC6EB]"></div>
                <div className="h-36 flex-1 rounded-t-lg bg-[#7FB3E4]"></div>
                <div className="h-30 flex-1 rounded-t-lg bg-[#5F9FDB]"></div>
                <div className="h-26 flex-1 rounded-t-lg bg-[#3E8BD2]"></div>
              </div>

              <div className="mt-4 flex justify-between text-xs text-gray-400">
                <span>08h</span>
                <span>10h</span>
                <span>12h</span>
                <span>14h</span>
                <span>16h</span>
                <span>18h</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0A2540]">Lembretes</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-[#FAFCFE] p-4 transition hover:border-[#BFD8F2] hover:bg-white">
                <p className="font-medium text-[#0A2540]">Tomar Losartana</p>
                <p className="mt-1 text-sm text-gray-500">Hoje às 20:00</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-[#FAFCFE] p-4 transition hover:border-[#BFD8F2] hover:bg-white">
                <p className="font-medium text-[#0A2540]">
                  Consulta com cardiologista
                </p>
                <p className="mt-1 text-sm text-gray-500">05/09 às 14:00</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}