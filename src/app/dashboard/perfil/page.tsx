import DashboardNavbar from "@/components/DashboardNavbar";
import {
  CalendarDays,
  Mail,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

export default function Perfil() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
          Minha conta
        </span>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
          Perfil
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Consulte e atualize as informações relacionadas à sua conta.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#E8F1FB] text-[#1565C0]">
              <UserRound size={36} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#0A2540]">
              João Silva
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Usuário do S.A.S.P.I.
            </p>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Conta
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={17} className="text-[#1565C0]" />
                  joao@email.com
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={17} className="text-[#26A69A]" />
                  (11) 99999-9999
                </div>
              </div>
            </div>
          </aside>

          <form className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                <UserRound size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações pessoais
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Dados utilizados na identificação da sua conta.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="nome"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Nome completo
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="nome"
                    type="text"
                    defaultValue="João Silva"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  E-mail
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    defaultValue="joao@email.com"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="telefone"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Telefone
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="telefone"
                    type="tel"
                    defaultValue="(11) 99999-9999"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="nascimento"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Data de nascimento
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="nascimento"
                    type="date"
                    defaultValue="1955-06-15"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md sm:w-auto"
              >
                <Save size={18} />
                Salvar alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}