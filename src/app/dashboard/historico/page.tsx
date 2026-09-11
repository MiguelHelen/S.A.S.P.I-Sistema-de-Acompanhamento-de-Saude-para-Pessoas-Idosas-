import DashboardNavbar from "@/components/DashboardNavbar";
import {
  Activity,
  Gauge,
  HeartPulse,
  Plus,
} from "lucide-react";

export default function Historico() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Registros
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Histórico de saúde
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Consulte os registros anteriores e acompanhe a evolução das
              informações de saúde.
            </p>
          </div>

          <a
            href="/dashboard/historico/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={19} />
            Novo registro
          </a>
        </div>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Registros recentes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informações registradas no acompanhamento.
              </p>
            </div>

            <select
              defaultValue="todos"
              className="rounded-xl border border-gray-200 bg-[#FAFCFE] px-4 py-2.5 text-sm font-medium text-[#0A2540] outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
            >
              <option value="todos">Todos os indicadores</option>
              <option value="frequencia">Frequência cardíaca</option>
              <option value="oxigenacao">Oxigenação</option>
              <option value="pressao">Pressão arterial</option>
            </select>
          </div>

          <div className="mt-8 space-y-4">
            <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <HeartPulse size={23} />
                </div>

                <div>
                  <p className="font-semibold text-[#0A2540]">
                    Frequência cardíaca
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Hoje às 16:30
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500">
                    Registro manual
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-2xl font-bold tracking-tight text-[#0A2540]">
                  72
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    bpm
                  </span>
                </p>

                <span className="mt-2 inline-flex rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                  Normal
                </span>
              </div>
            </article>

            <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <Activity size={23} />
                </div>

                <div>
                  <p className="font-semibold text-[#0A2540]">
                    Oxigenação
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Hoje às 15:45
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500">
                    Registro manual
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-2xl font-bold tracking-tight text-[#0A2540]">
                  97
                  <span className="ml-1 text-sm font-medium text-gray-500">
                    %
                  </span>
                </p>

                <span className="mt-2 inline-flex rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                  Normal
                </span>
              </div>
            </article>

            <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Gauge size={23} />
                </div>

                <div>
                  <p className="font-semibold text-[#0A2540]">
                    Pressão arterial
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Ontem às 20:10
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500">
                    Registro manual
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-2xl font-bold tracking-tight text-[#0A2540]">
                  120/80
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    mmHg
                  </span>
                </p>

                <span className="mt-2 inline-flex rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                  Normal
                </span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}