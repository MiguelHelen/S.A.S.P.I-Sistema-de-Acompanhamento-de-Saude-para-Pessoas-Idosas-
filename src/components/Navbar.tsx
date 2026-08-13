"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {menuOpen && (
          <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="/" className="text-sm font-medium text-[#0A2540]">
                Início
              </a>

              <a href="#sobre" className="text-sm font-medium text-gray-600">
                Sobre
              </a>

              <a
                href="#funcionalidades"
                className="text-sm font-medium text-gray-600"
              >
                Funcionalidades
              </a>

              <a href="#contato" className="text-sm font-medium text-gray-600">
                Contato
              </a>

              <a
                href="/login"
                className="rounded-lg bg-[#1565C0] px-5 py-2.5 text-center text-sm font-medium text-white"
              >
                Entrar
              </a>
            </div>
          </div>
        )}
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="S.A.S.P.I." className="h-13 w-auto" />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="/"
            className="text-sm font-medium text-[#0A2540] transition-colors duration-200 hover:text-[#1565C0]"
          >
            Início
          </a>

          <a
            href="#sobre"
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-[#1565C0]"
          >
            Sobre
          </a>

          <a
            href="#funcionalidades"
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-[#1565C0]"
          >
            Funcionalidades
          </a>

          <a
            href="#contato"
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-[#1565C0]"
          >
            Contato
          </a>

          <a
            href="/login"
            className="rounded-lg bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            Entrar
          </a>
        </div>
        <button
          type="button"
          className="flex items-center justify-center rounded-lg p-2 text-[#0A2540] transition hover:bg-gray-100 md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
    </nav>
  );
}
