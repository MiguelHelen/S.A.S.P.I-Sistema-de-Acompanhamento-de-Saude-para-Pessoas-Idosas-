"use client";

import { Bell, LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";

export default function DashboardNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
              className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
            >
              Minha Saúde
            </a>

            <a
              href="/dashboard/medicamentos"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
            >
              Medicamentos
            </a>

            <a
              href="/dashboard/consultas"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
            >
              Consultas
            </a>

            <a
              href="/dashboard/historico"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
            >
              Histórico
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-red-600 sm:flex"
          >
            <LogOut size={18} />
            Sair
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-[#0A2540] transition hover:bg-gray-100 lg:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <a
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#1565C0] hover:bg-gray-50"
            >
              Dashboard
            </a>

            <a
              href="/dashboard/saude"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Minha Saúde
            </a>

            <a
              href="/dashboard/medicamentos"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Medicamentos
            </a>

            <a
              href="/dashboard/consultas"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Consultas
            </a>

            <a
              href="/dashboard/historico"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Histórico
            </a>

            <a
              href="/dashboard/perfil"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:hidden"
            >
              Perfil
            </a>

            <a
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 sm:hidden"
            >
              <LogOut size={18} />
              Sair
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}