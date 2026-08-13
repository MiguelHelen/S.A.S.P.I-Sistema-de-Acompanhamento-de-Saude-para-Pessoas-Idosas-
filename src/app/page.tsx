import Navbar from "@/components/Navbar";
import { HeartPulse, ClipboardList, Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-8 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Conteúdo do Hero */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Saúde e tecnologia
            </span>

            <h1 className="mt-4 text-5xl font-bold leading-tight text-[#0A2540]">
              S.A.S.P.I.
            </h1>

            <h2 className="mt-3 text-2xl font-semibold text-[#1565C0]">
              Sistema de Acompanhamento de Saúde para Pessoas Idosas
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              Uma solução digital para auxiliar no acompanhamento da saúde de
              pessoas idosas, aproximando familiares, cuidadores e profissionais
              da saúde.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#sobre"
                className="rounded-lg bg-[#1565C0] px-6 py-3 font-medium text-white transition hover:bg-[#0A2540]"
              >
                Conheça o S.A.S.P.I.
              </a>

              <a
                href="#funcionalidades"
                className="rounded-lg border border-[#1565C0] px-6 py-3 font-medium text-[#1565C0] transition hover:bg-[#E6F4EF]"
              >
                Ver funcionalidades
              </a>
            </div>
          </div>

          {/* Espaço reservado para a ilustração */}
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl bg-white shadow-sm">
            <span className="text-gray-400">Ilustração do S.A.S.P.I.</span>
          </div>
        </div>
      </section>
      <section id="funcionalidades" className="mx-auto max-w-7xl px-8 pb-20">
        <div className="grid gap-6 md:grid-cols-3">

          <div className="min-h-[150px] rounded-2xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E6F4EF] text-[#1565C0]">
                <HeartPulse size={26} strokeWidth={2} />
              </div>

              <div className="h-14 w-px bg-gray-200"></div>

              <div>
                <h3 className="text-lg font-semibold text-[#0A2540]">
                  Monitoramento
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Acompanhe a saúde de forma remota e contínua, com mais
                  segurança e tranquilidade.
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-[150px] rounded-2xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E6F4EF] text-[#26A69A]">
                <ClipboardList size={26} strokeWidth={2} />
              </div>

              <div className="h-14 w-px bg-gray-200"></div>

              <div>
                <h3 className="text-lg font-semibold text-[#0A2540]">
                  Organização
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Centralize informações importantes em um único lugar,
                  facilitando o acesso e o acompanhamento.
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-[150px] rounded-2xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E6F4EF] text-[#26A69A]">
                <Cpu size={26} strokeWidth={2} />
              </div>

              <div className="h-14 w-px bg-gray-200"></div>

              <div>
                <h3 className="text-lg font-semibold text-[#0A2540]">
                  Tecnologia
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Integração entre aplicativo mobile, plataforma web e
                  dispositivos inteligentes para um cuidado mais eficiente.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </main>
  );
}
