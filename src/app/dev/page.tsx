import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Home,
  LogIn,
  Pill,
  Plus,
  UserPlus,
  UserRound,
} from "lucide-react";

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
    description: "Visão geral com indicadores, histórico e lembretes.",
    href: "/dashboard",
    icon: HeartPulse,
  },
  {
    title: "Minha Saúde",
    description: "Acompanhamento dos principais indicadores de saúde.",
    href: "/dashboard/saude",
    icon: HeartPulse,
  },
  {
    title: "Medicamentos",
    description: "Listagem e acompanhamento de medicamentos.",
    href: "/dashboard/medicamentos",
    icon: Pill,
  },
  {
    title: "Consultas",
    description: "Agenda e acompanhamento de consultas.",
    href: "/dashboard/consultas",
    icon: CalendarDays,
  },
  {
    title: "Histórico",
    description: "Registros anteriores de saúde.",
    href: "/dashboard/historico",
    icon: ClipboardList,
  },
  {
    title: "Perfil",
    description: "Informações pessoais da conta.",
    href: "/dashboard/perfil",
    icon: UserRound,
  },
];

const formRoutes = [
  {
    title: "Novo registro",
    description: "Formulário para registrar um novo indicador de saúde.",
    href: "/dashboard/historico/novo",
    category: "Saúde",
  },
  {
    title: "Novo medicamento",
    description: "Formulário para cadastrar um novo medicamento.",
    href: "/dashboard/medicamentos/novo",
    category: "Medicamentos",
  },
  {
    title: "Nova consulta",
    description: "Formulário para cadastrar uma nova consulta.",
    href: "/dashboard/consultas/nova",
    category: "Consultas",
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

      <h3 className="mt-5 font-semibold text-[#0A2540]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        {description}
      </p>

      <p className="mt-4 break-all font-mono text-xs text-[#1565C0]">
        {href}
      </p>
    </Link>
  );
}

export default function DevPage() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="flex flex-col gap-6 border-b border-gray-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#26A69A]">
              <FlaskConical size={18} />

              <span className="text-sm font-semibold uppercase tracking-wider">
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
              Páginas públicas
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Telas acessíveis antes da autenticação.
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
              Páginas do Dashboard
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Principais telas de acompanhamento do sistema.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboardRoutes.map((route) => (
              <RouteCard key={route.href} {...route} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Formulários
            </span>

            <h2 className="mt-2 text-2xl font-bold text-[#0A2540]">
              Fluxos de cadastro
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Acesso direto às telas utilizadas para inserir informações.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {formRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFD8F2] hover:shadow-lg hover:shadow-blue-950/5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                    <Plus size={21} />
                  </div>

                  <span className="rounded-full bg-[#F2F7FB] px-3 py-1 text-xs font-medium text-gray-500">
                    {route.category}
                  </span>
                </div>

                <h3 className="mt-5 font-semibold text-[#0A2540]">
                  {route.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {route.description}
                </p>

                <p className="mt-4 break-all font-mono text-xs text-[#1565C0]">
                  {route.href}
                </p>
              </Link>
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

              <p className="mt-2 font-semibold text-[#20877E]">
                Funcionando
              </p>
            </div>

            <div className="rounded-xl bg-[#F8FBFE] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Vulnerabilidades
              </p>

              <p className="mt-2 font-semibold text-[#20877E]">
                0 encontradas
              </p>
            </div>

            <div className="rounded-xl bg-[#F8FBFE] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Dados
              </p>

              <p className="mt-2 font-semibold text-[#1565C0]">
                Demonstrativos
              </p>
            </div>

            <div className="rounded-xl bg-[#F8FBFE] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Backend
              </p>

              <p className="mt-2 font-semibold text-gray-500">
                Ainda não integrado
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