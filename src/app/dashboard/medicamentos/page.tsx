import DashboardNavbar from "@/components/DashboardNavbar";
import { Pill, Plus } from "lucide-react";

export default function Medicamentos() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A2540] md:text-3xl">
              Medicamentos
            </h1>

            <p className="mt-2 text-gray-600">
              Acompanhe medicamentos, horários e próximos lembretes.
            </p>
          </div>

          <a
            href="/dashboard/medicamentos/novo"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#1565C0] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0A2540]"
          >
            <Plus size={18} />
            Novo medicamento
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#1565C0]">
                <Pill size={22} />
              </div>

              <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-medium text-[#0A2540]">
                Próximo
              </span>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#0A2540]">
              Losartana
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              50 mg
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">Horário</p>
              <p className="mt-1 font-medium text-[#0A2540]">
                20:00
              </p>
            </div>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                <Pill size={22} />
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Amanhã
              </span>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#0A2540]">
              Metformina
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              500 mg
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">Horário</p>
              <p className="mt-1 font-medium text-[#0A2540]">
                08:00
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}