import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  Gauge,
  HeartPulse,
  Save,
} from "lucide-react";

export default function NovoRegistro() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/historico"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para o histórico
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Registro de saúde
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo registro
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Adicione manualmente uma nova informação para o acompanhamento da
            saúde.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <HeartPulse size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações do indicador
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informe qual dado de saúde está sendo registrado.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="indicador"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Indicador de saúde
                </label>

                <select
                  id="indicador"
                  defaultValue=""
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="" disabled>
                    Selecione um indicador
                  </option>
                  <option value="frequencia">
                    Frequência cardíaca
                  </option>
                  <option value="oxigenacao">Oxigenação</option>
                  <option value="pressao">Pressão arterial</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="valor"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Valor
                </label>

                <input
                  id="valor"
                  type="text"
                  placeholder="Ex.: 72 ou 120/80"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="unidade"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Unidade de medida
                </label>

                <input
                  id="unidade"
                  type="text"
                  placeholder="Ex.: bpm, %, mmHg"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
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
                  placeholder="Adicione alguma informação importante sobre o registro..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-[#DCEAF8] bg-[#F8FBFE] p-5">
            <div className="flex gap-3">
              <ClipboardList
                size={20}
                className="mt-0.5 shrink-0 text-[#1565C0]"
              />

              <p className="text-sm leading-relaxed text-gray-600">
                Este registro será identificado como manual. Futuramente, dados
                compatíveis também poderão ser recebidos automaticamente pelos
                dispositivos integrados.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/historico"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <Save size={18} />
              Salvar registro
            </button>
          </div>
        </form>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm text-gray-500">
            <HeartPulse size={18} className="text-[#1565C0]" />
            Frequência cardíaca
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm text-gray-500">
            <Activity size={18} className="text-[#26A69A]" />
            Oxigenação
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm text-gray-500">
            <Gauge size={18} className="text-[#1565C0]" />
            Pressão arterial
          </div>
        </div>
      </div>
    </main>
  );
}