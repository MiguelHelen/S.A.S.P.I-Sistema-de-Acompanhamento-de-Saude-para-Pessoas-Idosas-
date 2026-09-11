import DashboardNavbar from "@/components/DashboardNavbar";
import {
  Activity,
  Gauge,
  HeartPulse,
  TrendingUp,
} from "lucide-react";

export default function MinhaSaude() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
          Acompanhamento
        </span>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
          Minha Saúde
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Acompanhe seus principais indicadores e a evolução dos registros de
          saúde.
        </p>

        {/* Indicadores */}
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-blue-950/5 transition hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <HeartPulse size={24} />
              </div>

              <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                Normal
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-gray-600">
              Frequência cardíaca
            </p>

            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-[#0A2540]">
                72
              </span>

              <span className="ml-2 text-sm font-medium text-gray-500">
                bpm
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Último registro: hoje às 16:30
            </p>
          </article>

          <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-blue-950/5 transition hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                <Activity size={24} />
              </div>

              <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                Normal
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-gray-600">
              Oxigenação
            </p>

            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-[#0A2540]">
                97
              </span>

              <span className="ml-1 text-sm font-medium text-gray-500">
                %
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Último registro: hoje às 15:45
            </p>
          </article>

          <article className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-blue-950/5 transition hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                <Gauge size={24} />
              </div>

              <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                Normal
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-gray-600">
              Pressão arterial
            </p>

            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-[#0A2540]">
                120/80
              </span>

              <span className="ml-2 text-sm font-medium text-gray-500">
                mmHg
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Último registro: ontem às 20:10
            </p>
          </article>
        </section>

        {/* Evolução */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-[#26A69A]" />

                <h2 className="text-xl font-semibold text-[#0A2540]">
                  Evolução dos indicadores
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Visualize como seus registros variam ao longo do tempo.
              </p>
            </div>

            <select
              className="rounded-xl border border-gray-200 bg-[#FAFCFE] px-4 py-2.5 text-sm font-medium text-[#0A2540] outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
              defaultValue="frequencia"
            >
              <option value="frequencia">Frequência cardíaca</option>
              <option value="oxigenacao">Oxigenação</option>
              <option value="pressao">Pressão arterial</option>
            </select>
          </div>

          {/* Gráfico temporário */}
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-[#F8FAFC] p-6">
            <div className="flex min-h-64 items-end gap-3">
              <div className="h-24 flex-1 rounded-t-lg bg-[#DCEAF8]" />
              <div className="h-32 flex-1 rounded-t-lg bg-[#BFD8F2]" />
              <div className="h-28 flex-1 rounded-t-lg bg-[#9FC6EB]" />
              <div className="h-40 flex-1 rounded-t-lg bg-[#7FB3E4]" />
              <div className="h-36 flex-1 rounded-t-lg bg-[#5F9FDB]" />
              <div className="h-44 flex-1 rounded-t-lg bg-[#3E8BD2]" />
              <div className="h-38 flex-1 rounded-t-lg bg-[#2378C2]" />
            </div>

            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Dados demonstrativos para apresentação do protótipo.
          </p>
        </section>
      </div>
    </main>
  );
}