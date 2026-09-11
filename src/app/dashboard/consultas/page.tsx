import DashboardNavbar from "@/components/DashboardNavbar";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Stethoscope,
} from "lucide-react";

export default function Consultas() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Agenda de saúde
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Consultas
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Acompanhe consultas agendadas, profissionais e informações
              importantes dos próximos atendimentos.
            </p>
          </div>

          <a
            href="/dashboard/consultas/nova"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={19} />
            Nova consulta
          </a>
        </div>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div>
            <h2 className="text-xl font-semibold text-[#0A2540]">
              Próximas consultas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Consulte os próximos compromissos de saúde cadastrados.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className="group rounded-2xl border border-gray-100 bg-[#FAFCFE] p-6 transition hover:-translate-y-0.5 hover:border-[#BFD8F2] hover:bg-white hover:shadow-lg hover:shadow-blue-950/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                  <Stethoscope size={24} />
                </div>

                <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-semibold text-[#20877E]">
                  Próxima
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold text-[#0A2540]">
                  Cardiologista
                </h3>

                <p className="mt-1 text-sm font-medium text-gray-500">
                  Dr. Carlos Almeida
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Data
                    </p>

                    <p className="mt-1 font-semibold text-[#0A2540]">
                      05/09/2026
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Horário
                    </p>

                    <p className="mt-1 font-semibold text-[#0A2540]">
                      14:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                <MapPin size={17} className="text-[#26A69A]" />
                Clínica Vida
              </div>
            </article>

            <article className="group rounded-2xl border border-gray-100 bg-[#FAFCFE] p-6 transition hover:-translate-y-0.5 hover:border-[#BFD8F2] hover:bg-white hover:shadow-lg hover:shadow-blue-950/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A] transition group-hover:bg-[#26A69A] group-hover:text-white">
                  <Stethoscope size={24} />
                </div>

                <span className="rounded-full bg-[#E8F1FB] px-3 py-1 text-xs font-semibold text-[#1565C0]">
                  Agendada
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold text-[#0A2540]">
                  Geriatra
                </h3>

                <p className="mt-1 text-sm font-medium text-gray-500">
                  Dra. Ana Martins
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Data
                    </p>

                    <p className="mt-1 font-semibold text-[#0A2540]">
                      12/09/2026
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Horário
                    </p>

                    <p className="mt-1 font-semibold text-[#0A2540]">
                      10:30
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                <MapPin size={17} className="text-[#26A69A]" />
                Centro Médico Sênior
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}