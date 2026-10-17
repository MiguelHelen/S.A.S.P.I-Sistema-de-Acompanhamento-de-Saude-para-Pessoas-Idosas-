"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import MetricCard from "@/components/MetricCard";
import InfoCard from "@/components/InfoCard";
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
  Loader2,
  AlertTriangle,
  Link2,
} from "lucide-react";

export default function Dashboard() {
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [user, setUser] = useState<{
    nome: string;
    perfil: string;
  }>({
    nome: "",
    perfil: "",
  });

  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);

  const carregarUsuario = useCallback(() => {
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        const data = parsed.user || parsed.usuario || parsed;

        setUser({
          nome:
            data.nome ||
            data.name ||
            (data.email ? data.email.split("@")[0] : "Profissional"),
          perfil: (data.perfil || data.role || "MEDICO").toUpperCase(),
        });
      } catch {}
    }

    const savedElderly = localStorage.getItem("saspi_active_elderly");
    if (savedElderly) {
      try {
        setIdosoAtivo(JSON.parse(savedElderly));
      } catch {}
    }
    setCarregandoSessao(false);
  }, []);

  useEffect(() => {
    carregarUsuario();

    function atualizarIdosoAtivo() {
      const savedElderly = localStorage.getItem("saspi_active_elderly");
      if (savedElderly) {
        try {
          setIdosoAtivo(JSON.parse(savedElderly));
        } catch {}
      } else {
        setIdosoAtivo(null);
      }
    }

    window.addEventListener("storage", carregarUsuario);
    window.addEventListener("saspi_user_updated", carregarUsuario);
    window.addEventListener("saspi_elderly_updated", atualizarIdosoAtivo);

    return () => {
      window.removeEventListener("storage", carregarUsuario);
      window.removeEventListener("saspi_user_updated", carregarUsuario);
      window.removeEventListener("saspi_elderly_updated", atualizarIdosoAtivo);
    };
  }, [carregarUsuario]);

  const perfilUpper = user.perfil;
  const isAdmin = perfilUpper === "ADMINISTRADOR" || perfilUpper === "ADMIN";
  const isMedicoOuEnfermeiro =
    perfilUpper === "MEDICO" || perfilUpper === "ENFERMEIRO";
  const isLeituraSomente =
    perfilUpper === "FAMILIAR" || perfilUpper === "CUIDADOR";

  function obterSaudacao() {
    const primeiroNome =
      user.nome && !user.nome.includes("@")
        ? user.nome.trim().split(" ")[0]
        : "Profissional";

    if (isAdmin) return `Olá, ${primeiroNome}!`;
    if (perfilUpper === "MEDICO") return `Olá, Dr(a). ${primeiroNome}!`;
    if (perfilUpper === "ENFERMEIRO") return `Olá, Enf. ${primeiroNome}!`;
    if (perfilUpper === "CUIDADOR") return `Olá, Cuidador(a) ${primeiroNome}!`;
    if (perfilUpper === "FAMILIAR") return `Olá, ${primeiroNome} (Familiar)!`;
    return `Olá, ${primeiroNome}!`;
  }

  if (carregandoSessao) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="flex h-96 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#1565C0]" />
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
              {isAdmin
                ? "Painel Administrativo"
                : isLeituraSomente
                  ? "Acompanhamento Compartilhado (LGPD)"
                  : "Acompanhamento Clínico Assistencial"}
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              {obterSaudacao()}
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              {isAdmin
                ? "Gestão institucional de profissionais, cuidadores e idosos do S.A.S.P.I."
                : idosoAtivo
                  ? `Acompanhamento em tempo real dos sinais vitais e da rotina de ${idosoAtivo.nome}.`
                  : "Selecione ou cadastre um idoso para iniciar o monitoramento."}
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

        {isAdmin ? (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Users size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Equipe e Usuários
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">
                  Gerenciados
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ClipboardList size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Idosos Registrados
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">
                  Centralizados
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <UserCheck size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Rede de Apoio
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">
                  Atribuições
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ShieldCheck size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Nível de Acesso
                </p>
                <p className="mt-1 text-xl font-bold text-[#20877E]">
                  {user.perfil || "ADMINISTRADOR"}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Ações de Gestão Institucional
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Atalhos operacionais definidos no módulo de administração do
                S.A.S.P.I.
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
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Registrar Usuário
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cadastrar médicos, cuidadores ou familiares.
                  </p>
                </Link>

                <Link
                  href="/dashboard/vinculos/novo"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                      <UserCheck size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Atribuir Idoso a Cuidador/Médico
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vincular pacientes aos profissionais autorizados.
                  </p>
                </Link>

                <Link
                  href="/dashboard/clinica"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                      <Building2 size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Dados da Clínica
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Gerenciar razão social, contato e endereço da instituição.
                  </p>
                </Link>

                <Link
                  href="/dashboard/vinculos"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                      <Link2 size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Listar Vínculos
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Visualizar associações entre equipe e pacientes.
                  </p>
                </Link>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <PatientSelector
              onSelect={(idoso) => setIdosoAtivo(idoso)}
              selectedId={idosoAtivo?.id}
            />

            {idosoAtivo ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Frequência Cardíaca"
                    value="--"
                    unit="bpm"
                    icon={<HeartPulse size={22} />}
                  />

                  <MetricCard
                    title="Oxigenação (SpO2)"
                    value="--"
                    unit="%"
                    icon={<Activity size={22} />}
                  />

                  <InfoCard
                    label="Próximo Medicamento"
                    title="Nenhuma prescrição ativa"
                    subtitle="Sem agendamento"
                    icon={<Pill size={22} />}
                  />

                  <InfoCard
                    label="Próxima Consulta"
                    title="Sem agendamento"
                    subtitle="Nenhuma consulta marcada"
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

                    <div className="mt-6 flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                      <Activity size={32} className="text-gray-300" />
                      <p className="mt-2 text-sm font-medium text-[#0A2540]">
                        Nenhum registro de telemetria recente
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Os dados aparecerão assim que a smartband ou uma
                        aferição manual for sincronizada.
                      </p>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#0A2540]">
                      Prescrições e Alertas
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {idosoAtivo ? `Rotina de ${idosoAtivo.nome}` : "Nenhum paciente selecionado"}
                    </p>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                        <Pill size={24} className="mx-auto text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-600">
                          Nenhum alerta ou medicação para hoje
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {isMedicoOuEnfermeiro
                            ? "Cadastre prescrições no módulo de Medicamentos."
                            : "Aguardando novas prescrições da equipe clínica."}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-[#FAFCFE] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Acomodação / Leito
                        </p>
                        <p className="mt-1 font-medium text-[#0A2540]">
                          {idosoAtivo.quarto || "Leito não informado"}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
                <Users size={40} className="mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-[#0A2540]">
                  Nenhum paciente selecionado
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Selecione um paciente acima para visualizar os dados clínicos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}