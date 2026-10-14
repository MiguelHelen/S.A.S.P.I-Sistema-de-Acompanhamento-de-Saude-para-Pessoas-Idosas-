"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import MetricCard from "@/components/MetricCard";
import InfoCard from "@/components/InfoCard";
import HealthChart from "@/components/HealthChart";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import {
  HeartPulse,
  Activity,
  Pill,
  CalendarDays,
  UserPlus,
  Users,
  Building2,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<{
    nome: string;
    perfil: string;
  }>({
    nome: "Wallex André",
    perfil: "MEDICO",
  });

  const [idosoAtivo, setIdosoAtivo] = useState<Idoso>({
    id: "1",
    nome: "Dona Francisca Silva",
    idade: 78,
  });

  function carregarUsuario() {
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        setUser({
          nome: parsed.nome || "Wallex André",
          perfil: parsed.perfil || "MEDICO",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  useEffect(() => {
    carregarUsuario();
    window.addEventListener("saspi_user_updated", carregarUsuario);
    return () => {
      window.removeEventListener("saspi_user_updated", carregarUsuario);
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
              {isAdmin ? "Painel Administrativo" : "Acompanhamento Clínico"}
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Olá, Dr(a). {user.nome.split(" ")[0]}!
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              {isAdmin
                ? "Gestão institucional de profissionais, cuidadores e idosos do S.A.S.P.I."
                : `Acompanhamento em tempo real dos sinais vitais e da rotina de ${idosoAtivo.nome}.`}
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/dashboard/usuarios/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <UserPlus size={18} />
              Novo Usuário
            </Link>
          )}
        </div>

        {/* --- VISTA ADMINISTRADOR --- */}
        {isAdmin ? (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Users size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Equipa e Utilizadores</p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">Gerenciados</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ClipboardList size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Idosos Registados</p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">Centralizados</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <UserCheck size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Rede de Apoio</p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">Atribuições</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ShieldCheck size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Nível de Acesso</p>
                <p className="mt-1 text-xl font-bold text-[#20877E]">ADMINISTRADOR</p>
              </div>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Ações de Gestão Institucional
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Atalhos operacionais definidos no módulo de administração do TCC.
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
                  <h3 className="mt-4 font-semibold text-[#0A2540]">Registar Utilizador</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cadastrar médicos, cuidadores ou familiares.
                  </p>
                </Link>

                <div className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                      <UserCheck size={20} />
                    </div>
                    <span className="rounded-full bg-[#E8F1FB] px-2.5 py-0.5 text-xs font-semibold text-[#1565C0]">Módulo TCC</span>
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">Atribuir Idoso a Cuidador/Médico</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vincular pacientes aos profissionais autorizados.
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
                  <h3 className="mt-4 font-semibold text-[#0A2540]">Dados da Conta</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Consultar e atualizar informações da clínica e perfil.
                  </p>
                </Link>
              </div>
            </section>
          </div>
        ) : (
          /* --- VISTA CLÍNICA (MÉDICO / ENFERMEIRO / CUIDADOR) --- */
          <div className="mt-8 space-y-8">
            {/* Seletor dinâmico do Idoso */}
            <PatientSelector onSelect={(idoso) => setIdosoAtivo(idoso)} />

            {/* Cartões com dados do idoso ativo */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Frequência Cardíaca"
                value={idosoAtivo.id === "1" ? "74" : idosoAtivo.id === "2" ? "82" : "68"}
                unit="bpm"
                icon={<HeartPulse size={22} />}
              />

              <MetricCard
                title="Oxigenação (SpO2)"
                value={idosoAtivo.id === "1" ? "98" : idosoAtivo.id === "2" ? "95" : "97"}
                unit="%"
                icon={<Activity size={22} />}
              />

              <InfoCard
                label="Próximo Medicamento"
                title={idosoAtivo.id === "1" ? "Losartana 50mg" : idosoAtivo.id === "2" ? "Metformina 850mg" : "Atenolol 25mg"}
                subtitle="Hoje às 20:00"
                icon={<Pill size={22} />}
              />

              <InfoCard
                label="Próxima Consulta"
                title="Reavaliação Cardíaca"
                subtitle="18/10 às 14:00"
                icon={<CalendarDays size={22} />}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0A2540]">
                      Evolução dos Sinais Vitais — {idosoAtivo.nome}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Monitoramento contínuo das últimas 24 horas
                    </p>
                  </div>

                  <Link
                    href="/dashboard/saude"
                    className="text-sm font-medium text-[#1565C0] hover:underline"
                  >
                    Ver histórico detalhado
                  </Link>
                </div>

                <div className="mt-6">
                  <HealthChart />
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#0A2540]">
                  Prescrições e Alertas
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Rotina de {idosoAtivo.nome}
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-[#FAFCFE] p-4 transition hover:border-[#BFD8F2] hover:bg-white">
                    <p className="font-medium text-[#0A2540]">Checagem de Pressão</p>
                    <p className="mt-1 text-sm text-gray-500">Rotina diária às 18:00</p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-[#FAFCFE] p-4 transition hover:border-[#BFD8F2] hover:bg-white">
                    <p className="font-medium text-[#0A2540]">Administração de Remédios</p>
                    <p className="mt-1 text-sm text-gray-500">Hoje às 20:00 (Cuidador noturno)</p>
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