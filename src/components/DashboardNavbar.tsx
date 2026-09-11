"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Minha Saúde",
    href: "/dashboard/saude",
  },
  {
    label: "Medicamentos",
    href: "/dashboard/medicamentos",
  },
  {
    label: "Consultas",
    href: "/dashboard/consultas",
  },
  {
    label: "Histórico",
    href: "/dashboard/historico",
  },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link
          href="/dashboard"
          className="flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="S.A.S.P.I."
            width={160}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#E8F1FB] text-[#1565C0]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0A2540]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            aria-label="Notificações"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-50 hover:text-[#1565C0]"
          >
            <Bell size={20} />
          </button>

          <Link
            href="/dashboard/perfil"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              pathname === "/dashboard/perfil"
                ? "bg-[#E8F1FB] text-[#1565C0]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#0A2540]"
            }`}
          >
            <UserRound size={18} />
            João
          </Link>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0A2540] transition hover:bg-gray-100 lg:hidden"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#E8F1FB] text-[#1565C0]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#0A2540]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="my-2 border-t border-gray-100" />

            <Link
              href="/dashboard/perfil"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                pathname === "/dashboard/perfil"
                  ? "bg-[#E8F1FB] text-[#1565C0]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <UserRound size={18} />
              Perfil
            </Link>

            <button
              type="button"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
