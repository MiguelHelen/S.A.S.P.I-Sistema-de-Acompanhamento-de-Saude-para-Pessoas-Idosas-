"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Users,
  HeartHandshake,
  LogOut,
  ChevronDown,
  Building2,
  Loader2,
  Link2,
} from "lucide-react";

interface UsuarioLogado {
  nome: string;
  email: string;
  perfil: string;
  clinica_id?: string;
  clinica_nome?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

const CLINICAL_NAV_LINKS = [
  { href: "/dashboard", label: "Visão Geral", icon: Activity },
  { href: "/dashboard/saude", label: "Sinais Vitais", icon: HeartPulse },
  { href: "/dashboard/medicamentos", label: "Medicamentos", icon: Pill },
  { href: "/dashboard/consultas", label: "Consultas", icon: CalendarDays },
  { href: "/dashboard/historico", label: "Histórico", icon: History },
];

const ADMIN_NAV_LINKS = [
  { href: "/dashboard", label: "Painel", icon: Activity },
  { href: "/dashboard/usuarios", label: "Usuários", icon: Users },
  { href: "/dashboard/idosos", label: "Idosos", icon: HeartHandshake },
  { href: "/dashboard/vinculos", label: "Vínculos", icon: Link2 },
  { href: "/dashboard/clinica", label: "Clínica", icon: Building2 },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [nomeClinica, setNomeClinica] = useState<string>("");
  const [buscandoClinica, setBuscandoClinica] = useState(false);

  const buscarNomeClinica = useCallback(
    async (cId: string, token: string | null) => {
      if (!cId) return;
      setBuscandoClinica(true);

      try {
        const res = await fetch(`${API_URL}/clinica/${cId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.nome) {
            setNomeClinica(data.nome);

            const userRaw = localStorage.getItem("saspi_user");
            if (userRaw) {
              try {
                const parsed = JSON.parse(userRaw);
                if (parsed.user) parsed.user.clinica_nome = data.nome;
                else if (parsed.usuario) parsed.usuario.clinica_nome = data.nome;
                else parsed.clinica_nome = data.nome;
                localStorage.setItem("saspi_user", JSON.stringify(parsed));
              } catch {}
            }
          }
        }
      } catch {} finally {
        setBuscandoClinica(false);
      }
    },
    []
  );

  const carregarUsuario = useCallback(() => {
    if (typeof window === "undefined") return;
    const userRaw = localStorage.getItem("saspi_user");
    const token = localStorage.getItem("saspi_token");

    if (!userRaw) return;

    try {
      const parsed = JSON.parse(userRaw);
      const userData = parsed.user || parsed.usuario || parsed;

      const cId =
        userData.clinica_id ||
        userData.clinicaId ||
        userData.clinica?.id ||
        "";

      const cNomeInicial =
        userData.clinica?.nome || userData.clinica_nome || "";

      setUsuario({
        nome:
          userData.nome ||
          userData.name ||
          (userData.email ? userData.email.split("@")[0] : "Usuário"),
        email: userData.email || "",
        perfil: (userData.perfil || userData.role || "MEDICO").toUpperCase(),
        clinica_id: cId,
        clinica_nome: cNomeInicial,
      });

      if (cNomeInicial) {
        setNomeClinica(cNomeInicial);
      } else if (cId) {
        buscarNomeClinica(cId, token);
      }
    } catch {}
  }, [buscarNomeClinica]);

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
  }, [carregarUsuario]);

  function handleLogout() {
    localStorage.removeItem("saspi_token");
    localStorage.removeItem("saspi_user");
    localStorage.removeItem("saspi_active_elderly");
    localStorage.removeItem("saspi_elderly_list");
    document.cookie = "saspi_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "saspi_user=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  }

  const isAdmin =
    usuario?.perfil === "ADMINISTRADOR" || usuario?.perfil === "ADMIN";
  const navLinksAtivos = isAdmin ? ADMIN_NAV_LINKS : CLINICAL_NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="S.A.S.P.I."
              width={160}
              height={40}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </Link>

          {(nomeClinica || buscandoClinica) && (
            <div className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 sm:flex">
              <Building2 size={14} className="text-[#1565C0]" />
              {buscandoClinica && !nomeClinica ? (
                <span className="flex items-center gap-1 text-gray-400">
                  <Loader2 size={12} className="animate-spin text-[#1565C0]" />
                  Carregando unidade...
                </span>
              ) : (
                <span className="font-semibold text-[#0A2540]">
                  {nomeClinica}
                </span>
              )}
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinksAtivos.map((link) => {
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

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownAberto((prev) => !prev)}
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
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg ring-1 ring-black/5">
              <div className="border-b border-gray-100 px-3 py-2 md:hidden">
                <p className="text-sm font-semibold text-[#0A2540]">
                  {usuario.nome}
                </p>
                <p className="text-xs text-gray-500">{usuario.email}</p>
                {nomeClinica && (
                  <p className="mt-1 text-xs font-medium text-[#1565C0]">
                    {nomeClinica}
                  </p>
                )}
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

                {isAdmin && (
                  <>
                    <Link
                      href="/dashboard/usuarios"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                    >
                      <Users size={16} className="text-[#1565C0]" />
                      Gerenciar Usuários
                    </Link>

                    <Link
                      href="/dashboard/idosos"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                    >
                      <HeartHandshake size={16} className="text-[#26A69A]" />
                      Gerenciar Idosos
                    </Link>

                    <Link
                      href="/dashboard/vinculos"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                    >
                      <Link2 size={16} className="text-[#1565C0]" />
                      Gerenciar Vínculos
                    </Link>

                    <Link
                      href="/dashboard/clinica"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                    >
                      <Building2 size={16} className="text-[#1565C0]" />
                      Dados da Clínica
                    </Link>

                    <Link
                      href="/dashboard/usuarios/novo"
                      onClick={() => setDropdownAberto(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                    >
                      <UserPlus size={16} className="text-[#26A69A]" />
                      Novo Usuário
                    </Link>
                  </>
                )}
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