import DashboardNavbar from "@/components/DashboardNavbar";

export default function NovoRegistro() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div>
          <a
            href="/dashboard/historico"
            className="text-sm font-medium text-[#1565C0] hover:underline"
          >
            ← Voltar ao histórico
          </a>

          <h1 className="mt-4 text-2xl font-bold text-[#0A2540] md:text-3xl">
            Novo registro de saúde
          </h1>

          <p className="mt-2 text-gray-600">
            Registre manualmente uma informação de saúde.
          </p>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="indicador"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Indicador
              </label>

              <select
                id="indicador"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#1565C0]"
              >
                <option value="">Selecione um indicador</option>
                <option value="frequencia-cardiaca">
                  Frequência cardíaca
                </option>
                <option value="oxigenacao">Oxigenação</option>
                <option value="pressao-arterial">Pressão arterial</option>
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
                placeholder="Ex: 72"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
              />
            </div>

            <div>
              <label
                htmlFor="unidade"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Unidade
              </label>

              <input
                id="unidade"
                type="text"
                placeholder="Ex: bpm, %, mmHg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
              />
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
                placeholder="Adicione uma observação, se necessário"
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-[#1565C0] px-5 py-3 font-medium text-white transition hover:bg-[#0A2540] sm:w-auto"
            >
              Salvar registro
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}