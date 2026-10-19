"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, ChevronDown, Activity, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface UsuarioLogado {
  id?: string;
  nome: string;
  email: string;
  perfil: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Efeito para detectar o scroll e adicionar sombra na navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efeito para verificar sessão e fechar menu ao clicar fora
  useEffect(() => {
    function carregarUsuario() {
      if (typeof window === "undefined") return;
      const userRaw = localStorage.getItem("saspi_user");
      const token = localStorage.getItem("saspi_token");

      if (userRaw && token) {
        try {
          const parsed = JSON.parse(userRaw);
          const userData = parsed.user || parsed.usuario || parsed;

          setUsuario({
            id: userData.id || "",
            nome: userData.nome || userData.name || (userData.email ? userData.email.split("@")[0] : "Usuário"),
            email: userData.email || "",
            perfil: (userData.perfil || userData.role || "MEDICO").toUpperCase(),
          });
        } catch {}
      } else {
        setUsuario(null);
      }
    }

    carregarUsuario();
    window.addEventListener("saspi_user_updated", carregarUsuario);
    window.addEventListener("storage", carregarUsuario);

    function handleClickFora(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => {
      window.removeEventListener("saspi_user_updated", carregarUsuario);
      window.removeEventListener("storage", carregarUsuario);
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("saspi_token");
    localStorage.removeItem("saspi_user");
    localStorage.removeItem("saspi_active_elderly");
    localStorage.removeItem("saspi_elderly_list");
    document.cookie = "saspi_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "saspi_user=; path=/; max-age=0; SameSite=Lax";
    setUsuario(null);
    setDropdownAberto(false);
    
    window.dispatchEvent(new Event("saspi_user_updated"));
    
    router.push("/");
  }

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Sobre o Projeto", href: "/sobre" },
    { name: "Funcionalidades", href: "/#funcionalidades" },
    { name: "Ajuda / FAQ", href: "/ajuda" },
    { name: "Contato", href: "/contato" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-sm backdrop-blur-md"
          : "bg-[#F2F7FB]"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="S.A.S.P.I."
            width={180}
            height={48}
            priority
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Links Desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition hover:text-[#1565C0] ${
                pathname === link.href ? "text-[#1565C0]" : "text-gray-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Botão de Entrar ou Perfil (Desktop) */}
        <div className="hidden md:block">
          {usuario ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownAberto(!dropdownAberto)}
                className="flex items-center gap-3 rounded-full border border-[#1565C0]/20 bg-white p-1.5 pr-4 transition hover:bg-gray-50 shadow-sm"
                aria-expanded={dropdownAberto}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1565C0] text-sm font-semibold text-white shadow-sm">
                  {usuario.nome.trim().charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-[#0A2540]">Painel</span>
                <ChevronDown
                  size={16}
                  className={`text-[#1565C0] transition-transform ${
                    dropdownAberto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownAberto && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                  <div className="border-b border-gray-100 px-3 py-3">
                    <p className="text-sm font-semibold text-[#0A2540] truncate">{usuario.nome}</p>
                    <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1565C0] transition hover:bg-[#E8F1FB]"
                    >
                      <Activity size={16} />
                      Acessar Sistema
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-[#1565C0] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A2540] shadow-sm hover:shadow-md"
            >
              <User size={16} />
              Entrar
            </Link>
          )}
        </div>

        {/* Botão Mobile */}
        <button
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <nav className="flex flex-col space-y-1 px-4 pb-6 pt-4 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-[#E8F1FB] hover:text-[#1565C0]"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="mt-4 border-t border-gray-100 pt-4">
              {usuario ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1565C0] text-base font-semibold text-white">
                      {usuario.nome.trim().charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A2540]">{usuario.nome}</p>
                      <p className="text-xs text-gray-500">{usuario.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-4 py-3 text-sm font-semibold text-white shadow-sm"
                  >
                    <Activity size={18} />
                    Acessar Painel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600"
                  >
                    <LogOut size={18} />
                    Sair da Conta
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#0A2540]"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={18} />
                  Entrar no Sistema
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}