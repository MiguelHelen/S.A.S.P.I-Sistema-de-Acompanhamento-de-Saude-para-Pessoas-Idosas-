import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Save,
  Stethoscope,
} from "lucide-react";

export default function NovaConsulta() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/consultas"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para consultas
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Agenda de saúde
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Nova consulta
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Registre as informações do próximo atendimento para manter a agenda
            organizada.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Stethoscope size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações da consulta
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados principais do atendimento.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="especialidade"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Especialidade
                </label>

                <input
                  id="especialidade"
                  type="text"
                  placeholder="Ex.: Cardiologista"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="profissional"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Profissional
                </label>

                <input
                  id="profissional"
                  type="text"
                  placeholder="Ex.: Dr. Carlos Almeida"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="data"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Data
                </label>

                <input
                  id="data"
                  type="date"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="horario"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Horário
                </label>

                <input
                  id="horario"
                  type="time"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="local"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Local
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="local"
                    type="text"
                    placeholder="Ex.: Clínica Vida"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="observacao"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Observação
                </label>

                <textarea
                  id="observacao"
                  rows={4}
                  placeholder="Ex.: levar resultados dos últimos exames..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-[#DCEAF8] bg-[#F8FBFE] p-5">
            <CalendarDays
              size={20}
              className="mt-0.5 shrink-0 text-[#1565C0]"
            />

            <p className="text-sm leading-relaxed text-gray-600">
              A consulta cadastrada aparecerá na agenda e nos lembretes do
              acompanhamento.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/consultas"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <Save size={18} />
              Salvar consulta
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}