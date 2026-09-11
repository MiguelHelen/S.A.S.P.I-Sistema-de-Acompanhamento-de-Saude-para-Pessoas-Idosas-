"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="S.A.S.P.I."
            width={180}
            height={48}
            className="h-12 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <Link href="/" className="text-sm font-medium text-[#1565C0]">
            Início
          </Link>

          <a
            href="#sobre"
            className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
          >
            Sobre
          </a>

          <a
            href="#funcionalidades"
            className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
          >
            Funcionalidades
          </a>

          <a
            href="#contato"
            className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
          >
            Contato
          </a>

          <Link
            href="/login"
            className="rounded-lg bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A2540]"
          >
            Entrar
          </Link>
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-lg p-2 text-[#0A2540] transition hover:bg-gray-100 lg:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="menu-publico-mobile"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="menu-publico-mobile"
          className="border-t border-gray-200 bg-white px-4 py-4 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:px-4">
            <Link href="/" className="text-sm font-medium text-[#1565C0]">
              Início
            </Link>

            <a
              href="#sobre"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
            >
              Sobre
            </a>

            <a
              href="#funcionalidades"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
            >
              Funcionalidades
            </a>

            <a
              href="#contato"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1565C0]"
            >
              Contato
            </a>

            <Link
              href="/login"
              className="rounded-lg bg-[#1565C0] px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#0A2540]"
            >
              Entrar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
