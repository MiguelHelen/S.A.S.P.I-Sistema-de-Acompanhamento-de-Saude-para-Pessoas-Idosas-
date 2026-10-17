import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Heart,
  Users,
  ShieldCheck,
  Target,
  ArrowRight,
  Lightbulb,
  Clock3,
} from "lucide-react";

const cardsContexto = [
  {
    icon: Users,
    titulo: "Envelhecimento populacional",
    descricao:
      "O acompanhamento da saúde se torna cada vez mais importante, exigindo atenção e organização.",
    cor: "bg-[#DDF3EE] text-[#159B87]",
  },
  {
    icon: Heart,
    titulo: "Justificativa social",
    descricao:
      "Mais do que tecnologia, o S.A.S.P.I. busca apoiar a autonomia, o cuidado e o bem-estar.",
    cor: "bg-[#DCECFB] text-[#187BC0]",
  },
  {
    icon: Target,
    titulo: "Tecnologia a favor da saúde",
    descricao:
      "Facilitar o acesso às informações e a comunicação entre as pessoas envolvidas nos cuidados.",
    cor: "bg-[#EAE7FC] text-[#6554D9]",
  },
];

const objetivos = [
  {
    icon: Target,
    titulo: "Objetivo geral",
    descricao:
      "Centralizar informações de saúde e facilitar o acompanhamento contínuo das pessoas idosas.",
    cor: "bg-[#DDF3EE] text-[#159B87]",
  },
  {
    icon: Users,
    titulo: "Objetivos específicos",
    descricao:
      "Organizar dados, facilitar o acesso e integrar as pessoas envolvidas no cuidado.",
    cor: "bg-[#DCECFB] text-[#187BC0]",
  },
  {
    icon: ShieldCheck,
    titulo: "Resultados esperados",
    descricao:
      "Contribuir para a autonomia, a qualidade de vida e a prevenção de riscos.",
    cor: "bg-[#EAE7FC] text-[#7650D8]",
  },
  {
    icon: Clock3,
    titulo: "Tecnologia como aliada",
    descricao:
      "Oferecer recursos simples, seguros e acessíveis para diferentes perfis de usuários.",
    cor: "bg-[#DDF3EE] text-[#159B87]",
  },
];

export default function SobrePage() {
  return (
    <>
      <Navbar />

      <main className="overflow-hidden text-[#102F50]">
        {/* Apresentação do projeto */}
        <section className="relative overflow-hidden bg-linear-to-r from-[#EDF7FD] via-[#F2F9FC] to-[#E7F5F3] px-5 py-10 md:px-8 md:py-12">
          <div className="absolute -right-20 top-8 h-56 w-56 rounded-full bg-[#D7F0ED]/70" />
          <div className="absolute -left-24 bottom-0 h-40 w-40 rounded-full bg-[#DCECFB]/70" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.15fr_1fr_0.45fr] lg:gap-5">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#159B87]">
                Sobre o projeto
              </span>

              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#102F50] md:text-5xl">
                S.A.S.P.I.
              </h1>

              <h2 className="mt-1 text-xl font-bold leading-snug text-[#187BC0] md:text-2xl">
                Tecnologia e cuidado para um envelhecimento mais saudável e
                seguro.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#577187] md:text-base md:leading-7">
                O S.A.S.P.I. é um sistema de acompanhamento de saúde para
                pessoas idosas, desenvolvido para facilitar o cuidado, a
                prevenção e a organização de informações de saúde, conectando
                idosos, familiares, profissionais e clínicas.
              </p>
            </div>

            {/* Ilustração do cuidado */}
            <div className="relative mx-auto flex min-h-65 w-full max-w-sm items-center justify-center md:min-h-72.5">
              <div className="absolute h-56 w-56 rounded-full bg-[#D4F0E9]/80 md:h-64 md:w-64" />
              <div className="absolute h-44 w-64 rounded-[48%] border border-white/80 bg-[#C9E9E8]/70 md:h-52 md:w-72" />

              <div className="relative flex flex-col items-center">
                <div className="flex items-end justify-center -space-x-3">
                  {/* Pessoa cuidadora */}
                  <div className="relative flex h-32 w-28 flex-col items-center md:h-36 md:w-32">
                    <div className="z-10 h-8 w-14 rounded-t-full bg-[#287EC0]" />

                    <div className="relative z-10 -mt-1 flex h-16 w-16 items-center justify-center rounded-[45%] border-4 border-[#E9F6FC] bg-[#F4CDAF]">
                      <div className="absolute -top-3 left-0 h-8 w-16 rounded-t-full bg-[#287EC0]" />

                      <div className="mt-3 flex gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#173D5D]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#173D5D]" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 h-14 w-24 rounded-t-[45%] bg-[#238ACB] md:w-28" />
                  </div>

                  {/* Pessoa idosa */}
                  <div className="relative flex h-32 w-28 flex-col items-center md:h-36 md:w-32">
                    <div className="z-10 h-8 w-16 rounded-t-full bg-[#D7DDE2]" />

                    <div className="relative z-10 -mt-1 flex h-16 w-16 items-center justify-center rounded-[45%] border-4 border-[#E9F6FC] bg-[#F2C7A5]">
                      <div className="absolute -top-2 h-7 w-16 rounded-t-full bg-[#E8E9E6]" />

                      <div className="mt-3 flex gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#173D5D]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#173D5D]" />
                      </div>

                      <div className="absolute -right-1.25 top-5 h-7 w-7 rounded-full border-[3px] border-[#187BC0] bg-transparent" />
                    </div>

                    <div className="absolute bottom-0 h-14 w-24 rounded-t-[45%] bg-[#174F7D] md:w-28" />
                  </div>
                </div>

                <div className="relative -mt-5 flex h-20 w-60 items-center justify-center">
                  <div className="absolute bottom-0 h-12 w-52 rounded-t-full bg-[#27B59A] opacity-90" />
                  <Heart className="relative z-10 h-10 w-10 fill-white text-white" />
                </div>
              </div>

              <div className="absolute left-3 top-8 h-3 w-3 rounded-full bg-[#27B59A]" />
              <div className="absolute right-4 top-12 h-2.5 w-2.5 rounded-full bg-[#187BC0]" />
              <div className="absolute bottom-8 left-8 h-2 w-2 rounded-full bg-[#187BC0]" />
            </div>

            <div className="hidden border-l-2 border-[#B8DFE5] pl-4 lg:block">
              <p className="text-lg font-medium leading-snug text-[#187BC0]">
                Mais cuidado
                <br />
                hoje, mais
                <br />
                independência
                <br />
                amanhã.
              </p>

              <div className="mt-3 h-1 w-8 rounded-full bg-[#27B59A]" />
            </div>
          </div>
        </section>

        {/* Contexto e justificativa */}
        <section className="bg-[#FBFDFE] px-5 py-9 md:px-8 md:py-11">
          <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.95fr_1.65fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#159B87]">
                Justificativa e contexto
              </span>

              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Por que o S.A.S.P.I.?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#577187]">
                O envelhecimento da população aumenta a importância de
                soluções que apoiem a organização das informações de saúde.
                O S.A.S.P.I. surge como uma proposta para aproximar tecnologia
                e cuidado, facilitando o acompanhamento e a comunicação entre
                as pessoas envolvidas.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {cardsContexto.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.titulo}
                    className="rounded-xl border border-[#DCEAF2] bg-linear-to-br from-white to-[#F0F8FC] p-4 shadow-[0_3px_12px_rgba(30,75,105,0.04)] transition hover:-translate-y-1 hover:shadow-md md:p-5"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${card.cor}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-[#174F7D]">
                      {card.titulo}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#577187] md:text-sm md:leading-6">
                      {card.descricao}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Objetivos */}
        <section
          id="objetivos"
          className="bg-linear-to-r from-[#F0F8FC] via-[#F5FAFD] to-[#EAF6F7] px-5 py-9 md:px-8 md:py-11"
        >
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_2fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#159B87]">
                Nossos objetivos
              </span>

              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Objetivos do S.A.S.P.I.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#577187]">
                Desenvolver uma solução digital que contribua para um
                acompanhamento mais eficiente, seguro e acessível da saúde
                das pessoas idosas.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {objetivos.map((objetivo) => {
                const Icon = objetivo.icon;

                return (
                  <article
                    key={objetivo.titulo}
                    className="rounded-xl border border-[#DCEAF2] bg-white/80 p-4 shadow-[0_3px_12px_rgba(30,75,105,0.04)] transition hover:-translate-y-1 hover:bg-white hover:shadow-md md:p-4"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${objetivo.cor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-[#174F7D]">
                      {objetivo.titulo}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#577187] md:text-sm md:leading-5">
                      {objetivo.descricao}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Banner verde-água (Com o padding corrigido para encostar no Footer) */}
        <section className="bg-[#F5FAFC] px-5 pb-16 md:px-8 md:pb-16">
          <div className="relative mx-auto flex max-w-7xl flex-col gap-5 overflow-hidden rounded-2xl border border-[#D7ECEB] bg-linear-to-r from-[#E2F5F0] via-[#E6F5F5] to-[#DDEFFA] px-6 py-6 md:flex-row md:items-center md:gap-6 md:px-9">
            <div className="absolute -right-5 top-0 h-36 w-36 rounded-full bg-white/25" />

            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#CDECE6]">
              <Lightbulb className="h-9 w-9 text-[#187BC0]" />
            </div>

            <div className="relative flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#159B87]">
                O futuro é o cuidado
              </span>

              <h2 className="mt-1 text-xl font-bold text-[#102F50]">
                Conheça o sistema
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-5 text-[#577187]">
                Descubra como o S.A.S.P.I. pode fazer a diferença na vida das
                pessoas idosas e de quem cuida delas.
              </p>
            </div>

            <Link
              href="/cadastro"
              className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#087FC2] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#066AA5]"
            >
              Explorar o sistema
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}