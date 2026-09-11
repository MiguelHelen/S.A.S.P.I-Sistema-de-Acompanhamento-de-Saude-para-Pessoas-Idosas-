import DashboardNavbar from "@/components/DashboardNavbar";
import { HeartPulse, Activity, Gauge } from "lucide-react";
import HealthChart from "@/components/HealthChart";

export default function MinhaSaude() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2540] md:text-3xl">
            Minha Saúde
          </h1>

          <p className="mt-2 text-gray-600">
            Acompanhe os principais indicadores de saúde.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#1565C0]">
                <HeartPulse size={22} />
              </div>

              <span className="text-xs text-gray-500">Último registro</span>
            </div>

            <p className="mt-5 text-sm text-gray-600">Frequência cardíaca</p>

            <div className="mt-2">
              <span className="text-3xl font-bold text-[#0A2540]">72</span>
              <span className="ml-2 text-sm text-gray-500">bpm</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                <Activity size={22} />
              </div>

              <span className="text-xs text-gray-500">Último registro</span>
            </div>

            <p className="mt-5 text-sm text-gray-600">Oxigenação</p>

            <div className="mt-2">
              <span className="text-3xl font-bold text-[#0A2540]">97</span>
              <span className="ml-1 text-sm text-gray-500">%</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#1565C0]">
                <Gauge size={22} />
              </div>

              <span className="text-xs text-gray-500">Último registro</span>
            </div>

            <p className="mt-5 text-sm text-gray-600">Pressão arterial</p>

            <div className="mt-2">
              <span className="text-3xl font-bold text-[#0A2540]">120/80</span>
              <span className="ml-2 text-sm text-gray-500">mmHg</span>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Evolução dos indicadores
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Visualize a evolução das informações registradas.
              </p>
            </div>

            <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none focus:border-[#1565C0]">
              <option>Frequência cardíaca</option>
              <option>Oxigenação</option>
              <option>Pressão arterial</option>
            </select>
          </div>

          <div className="mt-8 rounded-2xl border border-gray-100 bg-[#F8FAFC] p-4 md:p-6">
            <HealthChart />
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Dados demonstrativos para apresentação do protótipo.
          </p>
        </section>
      </div>
    </main>
  );
}
