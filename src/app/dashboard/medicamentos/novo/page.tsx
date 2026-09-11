import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";
import { ArrowLeft, Clock3, Pill, Save } from "lucide-react";

export default function NovoMedicamento() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/medicamentos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para medicamentos
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Rotina de cuidados
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo medicamento
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Cadastre as informações necessárias para organizar a rotina de
            medicamentos.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                <Pill size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações do medicamento
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados principais do medicamento.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="medicamento"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Nome do medicamento
                </label>

                <input
                  id="medicamento"
                  type="text"
                  placeholder="Ex.: Losartana"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="dosagem"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Dosagem
                </label>

                <input
                  id="dosagem"
                  type="text"
                  placeholder="Ex.: 50 mg"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
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
                  htmlFor="frequencia"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Frequência
                </label>

                <select
                  id="frequencia"
                  defaultValue=""
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="" disabled>
                    Selecione a frequência
                  </option>
                  <option value="diariamente">Uma vez ao dia</option>
                  <option value="12h">A cada 12 horas</option>
                  <option value="8h">A cada 8 horas</option>
                  <option value="personalizado">Personalizado</option>
                </select>
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
                  placeholder="Ex.: tomar após a refeição..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-[#D7EEE9] bg-[#F5FBF9] p-5">
            <Clock3
              size={20}
              className="mt-0.5 shrink-0 text-[#26A69A]"
            />

            <p className="text-sm leading-relaxed text-gray-600">
              O horário informado poderá ser utilizado futuramente pelo sistema
              para gerar lembretes relacionados à rotina de medicação.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/medicamentos"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <Save size={18} />
              Salvar medicamento
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}