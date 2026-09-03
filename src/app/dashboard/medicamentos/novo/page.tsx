import DashboardNavbar from "@/components/DashboardNavbar";

export default function NovoMedicamento() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <a
          href="/dashboard/medicamentos"
          className="text-sm font-medium text-[#1565C0] hover:underline"
        >
          ← Voltar para medicamentos
        </a>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-[#0A2540] md:text-3xl">
            Novo medicamento
          </h1>

          <p className="mt-2 text-gray-600">
            Adicione um medicamento e defina seu horário.
          </p>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="nome"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Medicamento
              </label>

              <input
                id="nome"
                type="text"
                placeholder="Ex: Losartana"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
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
                placeholder="Ex: 50 mg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
              />
            </div>

            <div>
              <label
                htmlFor="frequencia"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Frequência
              </label>

              <select
                id="frequencia"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
              >
                <option value="">Selecione</option>
                <option value="diario">Todos os dias</option>
                <option value="12h">A cada 12 horas</option>
                <option value="8h">A cada 8 horas</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="observacao"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Observação
              </label>

              <textarea
                id="observacao"
                rows={4}
                placeholder="Ex: tomar após o jantar"
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-[#1565C0] px-5 py-3 font-medium text-white transition hover:bg-[#0A2540] sm:w-auto"
            >
              Salvar medicamento
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}