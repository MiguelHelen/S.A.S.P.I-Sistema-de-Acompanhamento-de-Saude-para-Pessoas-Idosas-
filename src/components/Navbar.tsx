"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getTokenSessao,
  getUsuarioSessao,
  limparSessao,
  UsuarioSessao,
} from "@/lib/clinica";
import {
  HeartPulse,
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
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1565C0] text-white shadow-sm">
            <HeartPulse size={22} />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-[#0A2540]">
              S.A.S.P.I.
            </span>
            <span className="hidden text-[11px] font-medium text-gray-500 sm:block">
              Acompanhamento de Saúde da Pessoa Idosa
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS_PUBLICOS.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  ativo
                    ? "font-semibold text-[#1565C0]"
                    : "text-gray-600 hover:text-[#0A2540]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {autenticado && usuario ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A2540]"
              >
                <LayoutDashboard size={16} />
                Acessar Painel
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Encerrar sessão"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={16} />
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A2540]"
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-[#0A2540] md:hidden"
        >
          {menuAberto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuAberto && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {LINKS_PUBLICOS.map((item) => {
              const ativo = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAberto(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    ativo
                      ? "bg-[#E8F1FB] font-semibold text-[#1565C0]"
                      : "text-gray-700 hover:bg-gray-50"
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <LayoutDashboard size={16} />
                  Acessar Painel ({usuario.nome.split(" ")[0]})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600"
                >
                  <LogOut size={16} />
                  Sair da Conta
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuAberto(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white"
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