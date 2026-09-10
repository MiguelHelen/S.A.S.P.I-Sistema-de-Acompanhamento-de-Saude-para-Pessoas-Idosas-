import DashboardNavbar from "@/components/DashboardNavbar";
import MetricCard from "@/components/MetricCard";
import InfoCard from "@/components/InfoCard";
export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="text-2xl font-bold text-[#0A2540] md:text-3xl">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Acompanhe as principais informações de saúde.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard 
          title="Frequência cardíaca" 
          value="72" 
          unit="bpm" 
          />

          <MetricCard 
          title="Oxigenação" 
          value="97" 
          unit="%" 
          />

          <InfoCard
            label="Próximo medicamento"
            title="Losartana"
            subtitle="Hoje às 20:00"
          />

          <InfoCard
            label="Próxima consulta"
            title="Cardiologista"
            subtitle="05/09 às 14:00"
          />
        </div>
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Histórico recente
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Últimos registros de saúde
              </p>
            </div>

            <a
              href="/dashboard/historico"
              className="text-sm font-medium text-[#1565C0] hover:underline"
            >
              Ver histórico
            </a>
          </div>

          <div className="mt-6 divide-y divide-gray-100">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-[#0A2540]">
                  Frequência cardíaca
                </p>

                <p className="mt-1 text-sm text-gray-500">Hoje, 16:30</p>
              </div>

              <p className="font-semibold text-[#0A2540]">72 bpm</p>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-[#0A2540]">Oxigenação</p>

                <p className="mt-1 text-sm text-gray-500">Hoje, 15:45</p>
              </div>

              <p className="font-semibold text-[#0A2540]">97%</p>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-[#0A2540]">Pressão arterial</p>

                <p className="mt-1 text-sm text-gray-500">Ontem, 20:10</p>
              </div>

              <p className="font-semibold text-[#0A2540]">120/80 mmHg</p>
            </div>
          </div>
        </section>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <div>
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Evolução da frequência cardíaca
              </h2>

              <p className="mt-1 text-sm text-gray-500">Registros recentes</p>
            </div>

            <div className="mt-6 flex min-h-64 items-center justify-center rounded-xl bg-[#F8FAFC]">
              <p className="text-sm text-gray-400">Gráfico será exibido aqui</p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0A2540]">Lembretes</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="font-medium text-[#0A2540]">Tomar Losartana</p>

                <p className="mt-1 text-sm text-gray-500">Hoje às 20:00</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="font-medium text-[#0A2540]">
                  Consulta com cardiologista
                </p>

                <p className="mt-1 text-sm text-gray-500">05/09 às 14:00</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
