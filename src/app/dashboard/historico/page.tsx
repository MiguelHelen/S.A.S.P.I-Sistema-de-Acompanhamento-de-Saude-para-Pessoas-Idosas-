import DashboardNavbar from "@/components/DashboardNavbar";
export default function Historico() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A2540] md:text-3xl">
              Histórico
            </h1>

            <p className="mt-2 text-gray-600">
              Consulte os registros de saúde mais recentes.
            </p>
          </div>

          <a
            href="/dashboard/historico/novo"
            className="rounded-lg bg-[#1565C0] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#0A2540]"
          >
            Novo registro
          </a>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Registros de saúde
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Histórico de medições e informações registradas.
              </p>
            </div>

            <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none focus:border-[#1565C0]">
              <option>Todos os registros</option>
              <option>Frequência cardíaca</option>
              <option>Oxigenação</option>
              <option>Pressão arterial</option>
            </select>
          </div>

          <div className="mt-6 divide-y divide-gray-100">
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[#0A2540]">
                  Frequência cardíaca
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  01/09/2026 às 16:30
                </p>
              </div>

              <div className="sm:text-right">
                <p className="font-semibold text-[#0A2540]">72 bpm</p>
                <p className="mt-1 text-xs text-gray-400">Registro manual</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[#0A2540]">Oxigenação</p>

                <p className="mt-1 text-sm text-gray-500">
                  01/09/2026 às 15:45
                </p>
              </div>

              <div className="sm:text-right">
                <p className="font-semibold text-[#0A2540]">97%</p>
                <p className="mt-1 text-xs text-gray-400">Registro manual</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[#0A2540]">Pressão arterial</p>

                <p className="mt-1 text-sm text-gray-500">
                  31/08/2026 às 20:10
                </p>
              </div>

              <div className="sm:text-right">
                <p className="font-semibold text-[#0A2540]">120/80 mmHg</p>
                <p className="mt-1 text-xs text-gray-400">Registro manual</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
