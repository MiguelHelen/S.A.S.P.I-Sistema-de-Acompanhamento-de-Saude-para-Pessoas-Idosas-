"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  HeartHandshake,
  HeartPulse,
  Home,
  Link2,
  LogIn,
  Pill,
  UserPlus,
  UserRound,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

const publicRoutes = [
  {
    title: "Home",
    description: "Página inicial pública do S.A.S.P.I.",
    href: "/",
    icon: Home,
  },
  {
    title: "Login",
    description: "Tela de acesso do usuário.",
    href: "/login",
    icon: LogIn,
  },
  {
    title: "Cadastro",
    description: "Tela de criação de conta.",
    href: "/cadastro",
    icon: UserPlus,
  },
];

const dashboardRoutes = [
  {
    title: "Dashboard",
    description: "Visão geral e resumo do acompanhamento.",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Sinais Vitais",
    description: "Evolução dos indicadores fisiológicos.",
    href: "/dashboard/saude",
    icon: HeartPulse,
  },
  {
    title: "Medicamentos",
    description: "Plano de medicamentos e prescrições.",
    href: "/dashboard/medicamentos",
    icon: Pill,
  },
  {
    title: "Consultas",
    description: "Agenda de compromissos médicos.",
    href: "/dashboard/consultas",
    icon: CalendarDays,
  },
  {
    title: "Histórico",
    description: "Linha do tempo de registros clínicos.",
    href: "/dashboard/historico",
    icon: ClipboardList,
  },
  {
    title: "Novo Idoso",
    description: "Admissão e cadastro de pacientes.",
    href: "/dashboard/idosos/novo",
    icon: HeartHandshake,
  },
  {
    title: "Dados da Clínica",
    description: "Gestão institucional (Restrito Admin).",
    href: "/dashboard/clinica",
    icon: Building2,
  },
  {
    title: "Novo Usuário",
    description: "Cadastro de equipe (Restrito Admin).",
    href: "/dashboard/usuarios/novo",
    icon: UserPlus,
  },
  {
    title: "Atribuir Vínculo",
    description: "Associação profissional-idoso (Restrito Admin).",
    href: "/dashboard/vinculos/novo",
    icon: Link2,
  },
  {
    title: "Perfil",
    description: "Configurações da conta do usuário.",
    href: "/dashboard/perfil",
    icon: UserRound,
  },
];

function RouteCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof Home;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFD8F2] hover:shadow-lg hover:shadow-blue-950/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
          <Icon size={21} />
        </div>

        <span className="rounded-full bg-[#F2F7FB] px-3 py-1 text-xs font-medium text-gray-500">
          Abrir
        </span>
      </div>

      <h3 className="mt-5 font-semibold text-[#0A2540]">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        {description}
      </p>

      <p className="mt-4 break-all font-mono text-xs text-[#1565C0]">{href}</p>
    </Link>
  );
}

export default function DevPage() {
  const [apiStatus, setApiStatus] = useState("Verificando...");

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      notFound();
    }

    async function checkBackendConnection() {
      try {
        const response = await fetch(API_URL);
        if (response.ok || response.status === 404 || response.status === 401) {
          setApiStatus("Conectado 🟢");
        } else {
          setApiStatus("Erro na resposta 🟡");
        }
      } catch {
        setApiStatus("Offline 🔴");
      }
    }

    checkBackendConnection();
  }, []);

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2540] text-white">
                <FlaskConical size={20} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Ambiente de desenvolvimento
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Central de testes do S.A.S.P.I.
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              Atalhos para acessar rapidamente as telas do frontend durante o
              desenvolvimento e os testes do protótipo.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-[#1565C0] hover:text-[#1565C0]"
          >
            <ArrowLeft size={17} />
            Voltar para a Home
          </Link>
        </div>

        <section className="mt-10">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Área pública
            </span>

            <h2 className="mt-2 text-2xl font-bold text-[#0A2540]">
              Páginas de Acesso
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Telas institucionais e formulários de entrada.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicRoutes.map((route) => (
              <RouteCard key={route.href} {...route} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Área interna
            </span>

            <h2 className="mt-2 text-2xl font-bold text-[#0A2540]">
              Páginas do Dashboard e Gestão
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Principais telas de acompanhamento clínico e administração.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboardRoutes.map((route) => (
              <RouteCard key={route.href} {...route} />
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-[#DCEAF8] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-[#0A2540]">
            Estado atual do frontend
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-[#F8FBFE] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Build
              </p>
              <p className="mt-2 font-semibold text-[#20877E]">Otimizado</p>
            </div>

            <div className="rounded-xl bg-[#F8FBFE] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Segurança (RBAC)
              </p>
              <p className="mt-2 font-semibold text-[#20877E]">Proxy Ativo</p>
            </div>

            <div className="rounded-xl bg-[#F8FBFE] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Persistência
              </p>
              <p className="mt-2 font-semibold text-[#1565C0]">
                Híbrida (API + Sessão)
              </p>
            </div>

            <div className="rounded-xl bg-[#F8FBFE] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                API Backend
              </p>
              <p
                className={`mt-2 font-semibold ${
                  apiStatus.includes("Conectado")
                    ? "text-emerald-600"
                    : apiStatus.includes("Offline")
                      ? "text-red-500"
                      : "text-amber-500"
                }`}
              >
                {apiStatus}
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-400">
          Esta página existe apenas para facilitar o desenvolvimento e os testes
          do frontend do S.A.S.P.I.
        </footer>
      </div>
    </main>
  );
}