"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  getTokenSessao,
  getUsuarioSessao,
  limparSessao,
  UsuarioSessao,
} from "@/lib/clinica";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  LogIn,
} from "lucide-react";

const LINKS_PUBLICOS = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre o Sistema" },
  { href: "/ajuda", label: "Central de Ajuda" },
  { href: "/contato", label: "Contato" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    function sincronizarSessao() {
      const token = getTokenSessao();
      const user = getUsuarioSessao();
      setAutenticado(Boolean(token && user));
      setUsuario(user);
    }

    sincronizarSessao();
    window.addEventListener("saspi_user_updated", sincronizarSessao);
    window.addEventListener("storage", sincronizarSessao);

    return () => {
      window.removeEventListener("saspi_user_updated", sincronizarSessao);
      window.removeEventListener("storage", sincronizarSessao);
    };
  }, []);

  function handleLogout() {
    limparSessao();
    setAutenticado(false);
    setUsuario(null);
    setMenuAberto(false);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white shadow-[0_2px_12px_rgba(10,37,64,0.03)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl transition-transform duration-200 hover:scale-[1.02]"
        >
          <Image
            src="/logo.png"
            alt="S.A.S.P.I. — Sistema de Acompanhamento de Saúde para Pessoas Idosas"
            width={150}
            height={44}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {LINKS_PUBLICOS.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  ativo
                    ? "bg-[#E8F1FB]/80 font-semibold text-[#1565C0]"
                    : "text-gray-600 hover:bg-[#F2F7FB] hover:text-[#0A2540]"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-[#1565C0] transition-transform duration-200 origin-left ${
                    ativo ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {autenticado && usuario ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
              >
                <LayoutDashboard size={16} />
                Acessar Painel
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Encerrar sessão"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={16} />
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <LogIn size={16} />
              Entrar no Sistema
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto((prev) => !prev)}
          aria-label="Abrir menu de navegação"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#0A2540] transition hover:bg-gray-50 md:hidden"
        >
          {menuAberto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuAberto && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1.5">
            {LINKS_PUBLICOS.map((item) => {
              const ativo = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAberto(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    ativo
                      ? "bg-[#E8F1FB] font-semibold text-[#1565C0]"
                      : "text-gray-700 hover:bg-[#F2F7FB] hover:text-[#0A2540]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
            {autenticado && usuario ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuAberto(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A2540]"
                >
                  <LayoutDashboard size={16} />
                  Acessar Painel ({usuario.nome.split(" ")[0]})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <LogOut size={16} />
                  Sair da Conta
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuAberto(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A2540]"
              >
                <LogIn size={16} />
                Entrar no Sistema
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}