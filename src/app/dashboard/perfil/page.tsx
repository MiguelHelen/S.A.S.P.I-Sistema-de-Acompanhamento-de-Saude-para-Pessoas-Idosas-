import DashboardNavbar from "@/components/DashboardNavbar";
import { UserRound } from "lucide-react";

export default function Perfil() {
  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2540] md:text-3xl">
            Perfil
          </h1>

          <p className="mt-2 text-gray-600">
            Consulte e atualize suas informações pessoais.
          </p>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 border-b border-gray-100 pb-8 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E6F4EF] text-[#1565C0]">
              <UserRound size={34} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#0A2540]">
                João Silva
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Usuário do S.A.S.P.I.
              </p>
            </div>
          </div>

          <form className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="nome"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Nome completo
              </label>

              <input
                id="nome"
                type="text"
                defaultValue="João Silva"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                defaultValue="joao@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
              />
            </div>

            <div>
              <label
                htmlFor="telefone"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Telefone
              </label>

              <input
                id="telefone"
                type="tel"
                defaultValue="(11) 99999-9999"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
              />
            </div>

            <div>
              <label
                htmlFor="dataNascimento"
                className="mb-2 block text-sm font-medium text-[#0A2540]"
              >
                Data de nascimento
              </label>

              <input
                id="dataNascimento"
                type="date"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565C0]"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                className="w-full rounded-lg bg-[#1565C0] px-5 py-3 font-medium text-white transition hover:bg-[#0A2540] sm:w-auto"
              >
                Salvar alterações
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}