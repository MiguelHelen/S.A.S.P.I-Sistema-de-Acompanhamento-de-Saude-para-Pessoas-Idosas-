import DashboardNavbar from "@/components/DashboardNavbar";

export default function NovaConsulta() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <a
          href="/dashboard/consultas"
          className="text-sm font-medium text-[#1565C0] hover:underline"
        >
          ← Voltar para consultas
        </a>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-[#0A2540] md:text-3xl">
            Nova consulta
          </h1>

          <p className="mt-2 text-gray-600">
            Registre uma nova consulta para acompanhamento.
          </p>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <form className="space-y-6">
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
                placeholder="Ex: Cardiologista"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
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
                placeholder="Ex: Dr. Carlos Almeida"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
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
            </div>

            <div>
              <label
                htmlFor="local"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Local
              </label>

              <input
                id="local"
                type="text"
                placeholder="Ex: Clínica São Lucas"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
              />
            </div>

            <div>
              <label
                htmlFor="observacao"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Observações
              </label>

              <textarea
                id="observacao"
                rows={4}
                placeholder="Adicione informações importantes sobre a consulta"
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#1565C0]"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-[#1565C0] px-5 py-3 font-medium text-white transition hover:bg-[#0A2540] sm:w-auto"
            >
              Salvar consulta
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}