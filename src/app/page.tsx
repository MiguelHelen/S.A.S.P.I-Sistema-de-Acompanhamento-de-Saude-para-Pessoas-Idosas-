import Navbar from "@/components/Navbar";
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
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Conteúdo do Hero */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Saúde e tecnologia
            </span>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-[#0A2540] md:text-5xl">
              S.A.S.P.I.
            </h1>

            <h2 className="mt-3 text-xl font-semibold text-[#1565C0] md:text-2xl">
              Sistema de Acompanhamento de Saúde para Pessoas Idosas
            </h2>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
              Uma solução digital para auxiliar no acompanhamento da saúde de
              pessoas idosas, aproximando familiares, cuidadores e profissionais
              da saúde.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#sobre"
                className="rounded-lg bg-[#1565C0] px-6 py-3 text-center font-medium text-white transition hover:bg-[#0A2540]"
              >
                Conheça o S.A.S.P.I.
              </a>

              <a
                href="#funcionalidades"
                className="rounded-lg border border-[#1565C0] px-6 py-3 text-center font-medium text-[#1565C0] transition hover:bg-[#E6F4EF]"
              >
                Ver funcionalidades
              </a>
            </div>
          </div>

          <div className="relative min-h-80 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-blue-950/5 md:min-h-105 md:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E6F4EF]"></div>
            <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#E8F1FB]"></div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#26A69A]">
                    Acompanhamento
                  </span>

                  <p className="mt-1 font-semibold text-[#0A2540]">
                    Resumo de saúde
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#1565C0]">
                  <HeartPulse size={22} />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <Activity size={20} className="text-[#26A69A]" />

                  <p className="mt-3 text-xs text-gray-500">Oxigenação</p>

                  <p className="mt-1 text-xl font-bold text-[#0A2540]">97%</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <HeartPulse size={20} className="text-[#1565C0]" />

                  <p className="mt-3 text-xs text-gray-500">Frequência</p>

                  <p className="mt-1 text-xl font-bold text-[#0A2540]">
                    72 bpm
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-100 bg-[#FAFCFE] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                    <Pill size={20} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0A2540]">
                      Próximo medicamento
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Losartana • 20:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <CalendarDays size={20} className="text-[#1565C0]" />

                  <div>
                    <p className="text-sm font-medium text-[#0A2540]">
                      Próxima consulta
                    </p>

                    <p className="text-xs text-gray-500">Cardiologista</p>
                  </div>
                </div>

                <ShieldCheck size={20} className="text-[#26A69A]" />
              </div>
            </div>
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
                acompanhamento mais próximo da rotina da pessoa idosa.
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
                  Visualização de indicadores e registros importantes da saúde.
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
                  Histórico, medicamentos e consultas reunidos em um só lugar.
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
                  Informações disponíveis para pessoas autorizadas no
                  acompanhamento.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#26A69A] shadow-sm">
                  <Bell size={23} />
                </div>

                <h3 className="mt-5 font-semibold text-[#0A2540]">Lembretes</h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Apoio à rotina com lembretes de medicamentos e compromissos.
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
              O S.A.S.P.I. reúne recursos importantes para facilitar a
              organização e o acompanhamento das informações de saúde.
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
                Acompanhamento de informações como frequência cardíaca,
                oxigenação e outros registros de saúde.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <Pill size={23} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Medicamentos
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Organização dos medicamentos utilizados, horários e informações
                importantes para a rotina.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <CalendarDays size={23} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Consultas
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Registro e organização de consultas para facilitar o
                acompanhamento de compromissos de saúde.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <ClipboardList size={23} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Histórico
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Consulta de registros anteriores para visualizar informações de
                forma organizada ao longo do tempo.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Como funciona
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Informações conectadas em um único fluxo
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Os dados são registrados, organizados e apresentados de forma
              simples para facilitar o acompanhamento da saúde.
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
                Coleta de dados
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Informações podem ser registradas manualmente ou obtidas por
                dispositivos integrados.
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
                Centralização
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Os dados são organizados em um único ambiente para facilitar o
                acesso às informações.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <UsersRound size={24} />
              </div>

              <span className="mt-5 block text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
                Etapa 03
              </span>

              <h3 className="mt-2 text-lg font-semibold text-[#0A2540]">
                Acompanhamento
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Usuários autorizados podem acompanhar as informações
                relacionadas à pessoa idosa.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-[#F8FBFE] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <BellRing size={24} />
              </div>

              <span className="mt-5 block text-xs font-semibold uppercase tracking-wider text-[#26A69A]">
                Etapa 04
              </span>

              <h3 className="mt-2 text-lg font-semibold text-[#0A2540]">
                Histórico e alertas
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                O sistema mantém registros anteriores e auxilia no
                acompanhamento de situações importantes.
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
              Um sistema integrado
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Diferentes tecnologias trabalham em conjunto para apoiar o
              acompanhamento da saúde da pessoa idosa.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <Monitor size={24} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Plataforma Web
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Visualização e acompanhamento das principais informações de
                saúde.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <Smartphone size={24} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Aplicativo Mobile
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Registro e acesso às informações por meio de dispositivos
                móveis.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <Database size={24} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Banco de Dados
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Armazenamento e organização das informações utilizadas pelo
                sistema.
              </p>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <Watch size={24} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-[#0A2540]">
                Dispositivos Vestíveis
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Apoio à coleta automática de determinados indicadores de saúde.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
