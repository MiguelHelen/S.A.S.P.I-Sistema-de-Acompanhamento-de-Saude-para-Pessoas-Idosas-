import { Bell, LogOut, UserRound } from "lucide-react";

export default function DashboardNavbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-8">
          <a href="/dashboard" className="flex items-center">
            <img
              src="/logo.png"
              alt="S.A.S.P.I."
              className="h-12 w-auto"
            />
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            <a
              href="/dashboard"
              className="text-sm font-medium text-[#1565C0]"
            >
              Dashboard
            </a>

            <a
              href="/dashboard/saude"
              className="text-sm font-medium text-gray-600 hover:text-[#1565C0]"
            >
              Minha Saúde
            </a>

            <a
              href="/dashboard/medicamentos"
              className="text-sm font-medium text-gray-600 hover:text-[#1565C0]"
            >
              Medicamentos
            </a>

            <a
              href="/dashboard/consultas"
              className="text-sm font-medium text-gray-600 hover:text-[#1565C0]"
            >
              Consultas
            </a>

            <a
              href="/dashboard/historico"
              className="text-sm font-medium text-gray-600 hover:text-[#1565C0]"
            >
              Histórico
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-[#1565C0]"
            aria-label="Notificações"
          >
            <Bell size={20} />
          </button>

          <a
            href="/dashboard/perfil"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#0A2540] transition hover:bg-gray-100 sm:flex"
          >
            <UserRound size={18} />
            João
          </a>

          <a
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-red-600"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </a>
        </div>
      </div>
    </nav>
  );
}