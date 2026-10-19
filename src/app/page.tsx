"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  HeartPulse,
  ClipboardList,
  Monitor,
  Smartphone,
  Database,
  Watch,
  Activity,
  Bell,
  CalendarDays,
  Pill,
  ShieldCheck,
  Users,
  FolderHeart,
  DatabaseZap,
  UsersRound,
  BellRing,
  User,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [isLogado, setIsLogado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("saspi_token");
    if (token) {
      setIsLogado(true);
    }

    // Escutar eventos de login/logout globais
    const checkLoginStatus = () => {
      setIsLogado(!!localStorage.getItem("saspi_token"));
    };

    window.addEventListener("saspi_user_updated", checkLoginStatus);
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("saspi_user_updated", checkLoginStatus);
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F2F7FB] selection:bg-[#1565C0] selection:text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Conteúdo do Hero */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4EF] px-3 py-1 text-sm font-semibold uppercase tracking-wider text-[#26A69A] mb-6">
              <Activity size={14} />
              Saúde e Tecnologia
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-[#0A2540] md:text-5xl lg:text-6xl tracking-tight">
              S.A.S.P.I.
            </h1>

            <h2 className="mt-4 text-xl font-bold text-[#1565C0] md:text-2xl leading-snug">
              O Sistema de Acompanhamento de Saúde para Pessoas Idosas.
            </h2>

            <p className="mt-6 text-base leading-relaxed text-gray-600 md:text-lg">
              Uma plataforma integrada para auxiliar no acompanhamento da saúde
              e rotina diária de pessoas idosas, aproximando familiares,
              cuidadores e profissionais da saúde através de dispositivos
              inteligentes e monitoramento preventivo.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row items-start">
              {isLogado ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-8 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-xl"
                >
                  <Activity size={18} />
                  Acessar Painel Clínico
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-8 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-xl"
                >
                  <User size={18} />
                  Entrar no S.A.S.P.I.
                </Link>
              )}

              <Link
                href="#funcionalidades"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-3 text-center text-sm font-bold text-gray-700 transition-all hover:border-[#1565C0] hover:text-[#1565C0]"
              >
                Ver Funcionalidades
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-100 w-full items-center justify-center p-6 md:min-h-125">
            <div className="absolute left-1/2 top-1/2 -z-10 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-[#E8F1FB] to-[#E6F4EF] opacity-70 blur-3xl filter" />
            <Image
              src="/img.png"
              alt="Ecossistema Conectado S.A.S.P.I."
              width={800}
              height={800}
              priority
              className="h-full w-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section id="sobre" className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
                Sobre o projeto
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
                Tecnologia para tornar o acompanhamento de saúde mais simples
              </h2>

              <p className="mt-5 leading-relaxed text-gray-600">
                O S.A.S.P.I. é uma solução digital desenvolvida para auxiliar no
                acompanhamento da saúde de pessoas idosas, reunindo informações
                importantes em um ambiente organizado e acessível.
              </p>

              <p className="mt-4 leading-relaxed text-gray-600">
                A proposta é facilitar o registro e a consulta de dados de
                saúde, medicamentos, consultas e indicadores, permitindo um
                acompanhamento mais próximo da rotina da pessoa idosa de forma
                híbrida e segura.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <p className="font-semibold text-[#0A2540]">
                    Informação centralizada
                  </p>

                  <p className="text-sm text-gray-500">
                    Dados importantes organizados em um único ambiente.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1565C0] shadow-sm">
                  <HeartPulse size={23} />
                </div>

                <h3 className="mt-5 font-semibold text-[#0A2540]">
                  Acompanhamento
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Visualização de indicadores vitais e registros importantes da
                  saúde do paciente.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#26A69A] shadow-sm">
                  <ClipboardList size={23} />
                </div>

                <h3 className="mt-5 font-semibold text-[#0A2540]">
                  Organização
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Histórico completo, plano de medicamentos e agenda de
                  consultas em um só lugar.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1565C0] shadow-sm">
                  <Users size={23} />
                </div>

                <h3 className="mt-5 font-semibold text-[#0A2540]">
                  Acesso compartilhado
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Informações seguras e disponíveis para familiares e médicos
                  através de controle de acesso (RBAC).
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#26A69A] shadow-sm">
                  <Bell size={23} />
                </div>

                <h3 className="mt-5 font-semibold text-[#0A2540]">
                  Alertas Inteligentes
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Apoio à rotina com avaliação imediata de sinais vitais e
                  disparo de alertas clínicos para a rede de cuidado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="bg-[#F2F7FB] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Funcionalidades
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Recursos pensados para o acompanhamento diário
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              O S.A.S.P.I. reúne módulos essenciais para garantir que a rede de
              cuidado não perca nenhuma informação.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <Activity size={23} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Indicadores de saúde
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Acompanhamento e evolução temporal de sinais vitais como
                frequência cardíaca, oxigenação, temperatura e pressão.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <Pill size={23} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Plano de Medicamentos
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Organização visual dos medicamentos em uso contínuo, suas
                dosagens, horários de administração e regras prescritas.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <CalendarDays size={23} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Consultas Clínicas
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Agendamento estruturado de compromissos médicos, com indicação
                de especialidade, locais de atendimento e observações de
                preparo.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <ClipboardList size={23} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Histórico (Timeline)
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Visualização cronológica consolidada de todos os registros
                clínicos da vida do paciente num único painel de
                rastreabilidade.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Fluxo Operacional
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Informações conectadas em um ecossistema
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              O S.A.S.P.I. foi concebido para processar informações vitais de
              ponta a ponta.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <article className="group rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <FolderHeart size={24} />
              </div>

              <span className="mt-5 block text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
                Etapa 01
              </span>

              <h3 className="mt-2 text-lg font-semibold text-[#0A2540]">
                Coleta Híbrida
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Sinais vitais podem ser inseridos manualmente pela equipa
                médica/cuidador ou recolhidos automaticamente por wearables IoT.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <DatabaseZap size={24} />
              </div>

              <span className="mt-5 block text-xs font-semibold uppercase tracking-wider text-[#26A69A]">
                Etapa 02
              </span>

              <h3 className="mt-2 text-lg font-semibold text-[#0A2540]">
                Processamento
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                O Backend centraliza os dados com segurança relacional
                (PostgreSQL) e avalia matematicamente a gravidade clínica de
                cada aferição.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <BellRing size={24} />
              </div>

              <span className="mt-5 block text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
                Etapa 03
              </span>

              <h3 className="mt-2 text-lg font-semibold text-[#0A2540]">
                Alerta Imediato
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Se os valores ultrapassarem limites fisiológicos de segurança
                (ex: taquicardia ou febre), alertas são emitidos via WebSockets
                para a clínica.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <UsersRound size={24} />
              </div>

              <span className="mt-5 block text-xs font-semibold uppercase tracking-wider text-[#26A69A]">
                Etapa 04
              </span>

              <h3 className="mt-2 text-lg font-semibold text-[#0A2540]">
                Gestão Descentralizada
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                A informação flui para a interface Web do médico e para o Mobile
                App do familiar em simultâneo, suportada por autorização estrita
                (RBAC).
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#F2F7FB] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Tecnologias
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Arquitetura de Software
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              O S.A.S.P.I. foi desenvolvido utilizando ferramentas consolidadas
              e modernas do mercado de tecnologia.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <Monitor size={24} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Web App
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Construído em Next.js (React), tipado estaticamente com
                TypeScript e otimizado com Server Components.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <Smartphone size={24} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Mobile App
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Desenvolvido num ambiente cross-platform utilizando React Native
                e Expo Framework.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <Database size={24} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Backend & Cloud
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                API em NestJS integrada com Prisma ORM, conectada a uma
                infraestrutura de dados PostgreSQL na Supabase.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <Watch size={24} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Internet das Coisas
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Projetado para leitura passiva de sensores de pulseiras
                inteligentes via pontes nativas do sistema.
              </p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
