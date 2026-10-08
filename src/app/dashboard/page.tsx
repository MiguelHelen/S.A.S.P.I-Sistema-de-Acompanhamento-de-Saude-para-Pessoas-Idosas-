"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  UserPlus,
  Users,
  Building2,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  HeartPulse,
  Activity,
  Pill,
  CalendarDays,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import InfoCard from "@/components/InfoCard";
import HealthChart from "@/components/HealthChart";

export default function Dashboard() {
  const [user, setUser] = useState<{
    nome: string;
    perfil: string;
  }>({
    nome: "Administrador",
    perfil: "ADMINISTRADOR",
  });

  function loadUserData() {
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        setUser({
          nome: parsed.nome || "Administrador",
          perfil: parsed.perfil || "ADMINISTRADOR",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  useEffect(() => {
    loadUserData();
    window.addEventListener("saspi_user_updated", loadUserData);
    return () => {
      window.removeEventListener("saspi_user_updated", loadUserData);
    };
  }, []);

  const isAdmin = user.perfil === "ADMINISTRADOR";

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              {isAdmin ? "Painel Administrativo" : "Acompanhamento Clinico"}
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Ola, {user.nome}!
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              {isAdmin
                ? "Gestao de profissionais, cuidadores, idosos e vinculos institucionais."
                : "Acompanhe os principais indicadores de saude do idoso vinculado."}
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/usuarios/novo"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
              >
                <UserPlus size={18} />
                Novo Usuario
              </Link>
            </div>
          )}
        </div>

        {/* PAINEL DO ADMINISTRADOR */}
        {isAdmin ? (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Users size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Usuarios da Clinica</p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">Gerenciados</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ClipboardList size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Idosos Cadastrados</p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">Em Acompanhamento</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <UserCheck size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Rede de Apoio (Vinculos)</p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">Atribuicoes</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ShieldCheck size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Nivel de Acesso</p>
                <p className="mt-1 text-xl font-bold text-[#20877E]">ADMINISTRADOR</p>
              </div>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Acoes de Gestao do S.A.S.P.I.
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Operacoes para organizar a instituicao, cadastrar membros e definir responsaveis.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/dashboard/usuarios/novo"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                      <UserPlus size={20} />
                    </div>
                    <ArrowRight size={18} className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]" />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">Cadastrar Usuario</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Registrar medicos, cuidadores ou familiares na clinica.
                  </p>
                </Link>

                <div className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                      <UserCheck size={20} />
                    </div>
                    <span className="rounded-full bg-[#E8F1FB] px-2.5 py-0.5 text-xs font-semibold text-[#1565C0]">Modulo TCC</span>
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">Atribuir Idoso a Profissional</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Definir quais idosos cada medico ou cuidador tem acesso para acompanhar.
                  </p>
                </div>

                <Link
                  href="/dashboard/perfil"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                      <Building2 size={20} />
                    </div>
                    <ArrowRight size={18} className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]" />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">Configuracoes da Conta</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Editar dados cadastrais e telefone do administrador.
                  </p>
                </Link>
              </div>
            </section>
          </div>
        ) : (
          /* PAINEL CLINICO (MEDICO, CUIDADOR, FAMILIAR) */
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-[#E8F1FB] p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1565C0]">Idoso em Acompanhamento</p>
                <p className="mt-1 text-lg font-bold text-[#0A2540]">Dona Francisca Silva, 78 anos</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1565C0] shadow-sm">
                Alterar Idoso
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Frequencia cardiaca" value="72" unit="bpm" icon={<HeartPulse size={22} />} />
              <MetricCard title="Oxigenacao (SpO2)" value="97" unit="%" icon={<Activity size={22} />} />
              <InfoCard label="Proximo medicamento" title="Losartana 50mg" subtitle="Hoje as 20:00" icon={<Pill size={22} />} />
              <InfoCard label="Proxima consulta" title="Cardiologista" subtitle="05/09 as 14:00" icon={<CalendarDays size={22} />} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0A2540]">Evolucao dos Sinais Vitais</h2>
                    <p className="mt-1 text-sm text-gray-500">Monitoramento cardiaco contínuo</p>
                  </div>
                  <Link href="/dashboard/saude" className="text-sm font-medium text-[#1565C0] hover:underline">
                    Ver detalhes
                  </Link>
                </div>
                <div className="mt-6">
                  <HealthChart />
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#0A2540]">Lembretes do Dia</h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-[#FAFCFE] p-4">
                    <p className="font-medium text-[#0A2540]">Tomar Losartana</p>
                    <p className="mt-1 text-sm text-gray-500">Hoje as 20:00</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-[#FAFCFE] p-4">
                    <p className="font-medium text-[#0A2540]">Consulta Geriatra</p>
                    <p className="mt-1 text-sm text-gray-500">12/09 as 10:30</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}