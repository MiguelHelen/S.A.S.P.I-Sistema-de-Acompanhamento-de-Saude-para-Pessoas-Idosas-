"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  HeartPulse,
  Pill,
  CalendarDays,
  History,
  User,
  UserPlus,
  LogOut,
  ChevronDown,
  Building2,
} from "lucide-react";

interface UsuarioLogado {
  nome: string;
  email: string;
  perfil: string;
  clinica_id?: string;
  clinica_nome: string;
}

// Mapeamento dos registros reais do seu Supabase/PostgreSQL
const CLINICAS_MAP: Record<string, string> = {
  "e63b19f5-d8e4-4973-bac6-12aba9a0545d": "Clinica Teste",
  "f24f8c67-cca5-4546-a5cb-b43a122fddcb": "Clinica Validacao",
};

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://perfect-bravery-production-5ce7.up.railway.app";

  async function carregarUsuario() {
    if (typeof window === "undefined") return;
    const userRaw = localStorage.getItem("saspi_user");
    const token = localStorage.getItem("saspi_token");

    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        const userData = parsed.user || parsed.usuario || parsed;

        const cId =
          userData.clinica_id ||
          userData.clinicaId ||
          userData.clinica?.id ||
          "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

        // 1. Tenta pegar o nome da clínica pelo objeto, pelo mapa de IDs ou busca remota
        let cNome =
          userData.clinica?.nome ||
          userData.clinica_nome ||
          CLINICAS_MAP[cId] ||
          "Clinica Teste";

        setUsuario({
          nome: userData.nome || userData.name || (userData.email ? userData.email.split("@")[0] : "Usuário"),
          email: userData.email || "",
          perfil: userData.perfil || userData.role || "MEDICO",
          clinica_id: cId,
          clinica_nome: cNome,
        });

        // 2. Se a API tiver endpoint de clínica, tenta consultar para manter dinâmico
        if (cId && token && !userData.clinica?.nome && !CLINICAS_MAP[cId]) {
          try {
            const resClinica = await fetch(`${apiUrl}/clinica/${cId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resClinica.ok) {
              const clinicaData = await resClinica.json();
              if (clinicaData?.nome) {
                setUsuario((prev) =>
                  prev ? { ...prev, clinica_nome: clinicaData.nome } : null
                );
              }
            }
          } catch {
            // Mantém o nome já definido
          }
        }
      } catch (err) {
        console.error("Erro ao ler dados da sessão na navbar:", err);
      }
    }
  }

  useEffect(() => {
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
    router.push("/login");
  }

  const links = [
    { href: "/dashboard", label: "Visão Geral", icon: Activity },
    { href: "/dashboard/saude", label: "Sinais Vitais", icon: HeartPulse },
    { href: "/dashboard/medicamentos", label: "Medicamentos", icon: Pill },
    { href: "/dashboard/consultas", label: "Consultas", icon: CalendarDays },
    { href: "/dashboard/historico", label: "Histórico", icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        
        {/* LOGO & CLÍNICA REAL DO BANCO */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="S.A.S.P.I."
              width={160}
              height={40}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          {usuario?.clinica_nome && (
            <div className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 sm:flex">
              <Building2 size={14} className="text-[#1565C0]" />
              <span className="font-semibold text-[#0A2540]">
                {usuario.clinica_nome}
              </span>
            </div>
          )}
        </div>

        {/* Links Centrais */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const ativo =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  ativo
                    ? "bg-[#E8F1FB] text-[#1565C0]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0A2540]"
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Menu do Usuário */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownAberto(!dropdownAberto)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-gray-50"
            aria-expanded={dropdownAberto}
          >
            {usuario ? (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1565C0] text-sm font-semibold text-white shadow-sm">
                {usuario.nome.trim().charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200" />
            )}

            <div className="hidden text-left md:block">
              {!usuario ? (
                <div className="space-y-1">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#0A2540]">
                    {usuario.nome}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {usuario.perfil}
                  </p>
                </>
              )}
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                dropdownAberto ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownAberto && usuario && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95">
              <div className="border-b border-gray-100 px-3 py-2 md:hidden">
                <p className="text-sm font-semibold text-[#0A2540]">{usuario.nome}</p>
                <p className="text-xs text-gray-500">{usuario.email}</p>
                <p className="mt-1 text-xs font-medium text-[#1565C0]">
                  {usuario.clinica_nome}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/perfil"
                  onClick={() => setDropdownAberto(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                >
                  <User size={16} />
                  Meu Perfil
                </Link>

                <Link
                  href="/dashboard/usuarios/novo"
                  onClick={() => setDropdownAberto(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                >
                  <UserPlus size={16} className="text-[#26A69A]" />
                  Cadastrar Novo Usuário
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Sair da Conta
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}