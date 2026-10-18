"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { gerarAlertasClinicos } from "@/components/MetricCard";
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
  Bell,
  AlertTriangle,
  UserCheck,
  Menu,
  X,
} from "lucide-react";

interface UsuarioLogado {
  id?: string;
  nome: string;
  email: string;
  perfil: string;
  clinica_id?: string;
  clinica_nome?: string;
}

interface NotificacaoSistema {
  id: string;
  tipo: "alerta_clinico" | "vinculo" | "consulta";
  titulo: string;
  descricao: string;
  dataHora?: string;
  href: string;
  critico?: boolean;
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

function formatarPapelVinculo(tipo?: string): string {
  const t = String(tipo || "").toUpperCase();
  if (t === "MEDICO_RESPONSAVEL") return "Médico(a) Responsável";
  if (t === "ENFERMEIRO" || t === "ENFERMEIRO_RESPONSAVEL")
    return "Enfermeiro(a)";
  if (t === "CUIDADOR") return "Cuidador(a)";
  if (t === "FAMILIAR") return "Familiar";
  return "Acompanhamento";
}

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [nomeClinica, setNomeClinica] = useState<string>("");
  const [buscandoClinica, setBuscandoClinica] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoSistema[]>([]);

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
                else if (parsed.usuario)
                  parsed.usuario.clinica_nome = data.nome;
                else parsed.clinica_nome = data.nome;
                localStorage.setItem("saspi_user", JSON.stringify(parsed));
              } catch {}
            }
          }
        }
      } catch {
      } finally {
        setBuscandoClinica(false);
      }
    },
    []
  );

  const carregarNotificacoes = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("saspi_token");
    const userRaw = localStorage.getItem("saspi_user");
    if (!token || !userRaw) return;

    let userId = "";
    let perfil = "";
    try {
      const parsed = JSON.parse(userRaw);
      const u = parsed.user || parsed.usuario || parsed;
      userId = u.id || "";
      perfil = String(u.perfil || u.role || "").toUpperCase();
    } catch {
      return;
    }

    if (!userId) return;

    const headers = { Authorization: `Bearer ${token}` };
    const listaNotif: NotificacaoSistema[] = [];

    try {
      if (perfil === "ADMINISTRADOR" || perfil === "ADMIN") {
        const resVinc = await fetch(`${API_URL}/usuario-idoso`, {
          headers,
        }).catch(() => null);
        if (resVinc?.ok) {
          const vincs = await resVinc.json();
          if (Array.isArray(vincs)) {
            vincs.slice(0, 5).forEach((v: any) => {
              if (v.usuario?.nome && v.idoso?.nome) {
                listaNotif.push({
                  id: `vinc-adm-${v.id}`,
                  tipo: "vinculo",
                  titulo: "Vínculo Institucional Ativo",
                  descricao: `${v.usuario.nome} foi vinculado(a) a ${v.idoso.nome} (${formatarPapelVinculo(v.tipo_vinculo)}).`,
                  dataHora: v.data_vinculo
                    ? new Date(v.data_vinculo).toLocaleDateString("pt-BR")
                    : undefined,
                  href: "/dashboard/vinculos",
                });
              }
            });
          }
        }
        setNotificacoes(listaNotif);
        return;
      }

      const activeElderlyRaw = localStorage.getItem("saspi_active_elderly");
      let idosoAtivo: { id?: string; nome?: string } | null = null;
      if (activeElderlyRaw) {
        try {
          idosoAtivo = JSON.parse(activeElderlyRaw);
        } catch {}
      }

      if (idosoAtivo?.id) {
        const [resSaude, resCons] = await Promise.all([
          fetch(`${API_URL}/registro-saude/idoso/${idosoAtivo.id}`, {
            headers,
          }).catch(() => null),
          fetch(`${API_URL}/consulta?idoso_id=${idosoAtivo.id}`, {
            headers,
          }).catch(() => null),
        ]);

        if (resSaude?.ok) {
          const regs = await resSaude.json();
          if (Array.isArray(regs)) {
            let fc = "--";
            let spo2 = "--";
            let temp = "--";
            let pa = "--/--";

            regs.forEach((r: any) => {
              const nomeInd = String(
                r.indicador_saude?.nome || r.indicador_nome || ""
              ).toLowerCase();
              const val = String(
                r.valor_numerico ?? r.valor_categorico ?? r.valor ?? "--"
              );
              if (nomeInd.includes("card") && fc === "--") fc = val;
              else if (
                (nomeInd.includes("oxig") || nomeInd.includes("spo")) &&
                spo2 === "--"
              )
                spo2 = val;
              else if (nomeInd.includes("temp") && temp === "--") temp = val;
              else if (nomeInd.includes("press") && pa === "--/--") pa = val;
            });

            const alertasClinicos = gerarAlertasClinicos({
              fc,
              spo2,
              temp,
              pa,
            });
            alertasClinicos.forEach((alerta) => {
              listaNotif.push({
                id: `${alerta.id}-${idosoAtivo?.id}`,
                tipo: "alerta_clinico",
                titulo: `Alerta: ${alerta.indicador} (${idosoAtivo?.nome})`,
                descricao: alerta.mensagem,
                href: "/dashboard/saude",
                critico: true,
              });
            });
          }
        }

        if (resCons?.ok) {
          const cons = await resCons.json();
          if (Array.isArray(cons)) {
            cons
              .filter(
                (c: any) =>
                  c.status !== "Cancelada" && c.status !== "Realizada"
              )
              .slice(0, 2)
              .forEach((c: any) => {
                const dtBr = c.data
                  ? new Date(c.data).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })
                  : "";
                listaNotif.push({
                  id: `cons-notif-${c.id}`,
                  tipo: "consulta",
                  titulo: `Consulta ${c.status || "Agendada"}: ${c.especialidade}`,
                  descricao: `Paciente ${idosoAtivo?.nome} • ${dtBr} às ${c.horario || ""} (${c.medico || ""}).`,
                  href: "/dashboard/consultas",
                });
              });
          }
        }
      }

      const resMeusVinculos = await fetch(
        `${API_URL}/usuario-idoso/usuario/${userId}`,
        { headers }
      ).catch(() => null);

      if (resMeusVinculos?.ok) {
        const meusVinculos = await resMeusVinculos.json();
        if (Array.isArray(meusVinculos)) {
          meusVinculos.forEach((v: any) => {
            if (v.idoso?.nome) {
              listaNotif.push({
                id: `meu-vinculo-${v.id}`,
                tipo: "vinculo",
                titulo: "Vínculo de Paciente Atribuído",
                descricao: `Você foi vinculado(a) a ${v.idoso.nome} como ${formatarPapelVinculo(v.tipo_vinculo)} pela Administração.`,
                dataHora: v.data_vinculo
                  ? new Date(v.data_vinculo).toLocaleDateString("pt-BR")
                  : undefined,
                href: "/dashboard",
              });
            }
          });
        }
      }

      setNotificacoes(listaNotif);
    } catch {}
  }, []);

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
        id: userData.id || "",
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
    carregarNotificacoes();

    window.addEventListener("saspi_user_updated", carregarUsuario);
    window.addEventListener("saspi_elderly_updated", carregarNotificacoes);
    window.addEventListener("storage", carregarUsuario);

    function handleClickFora(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownAberto(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotificacoesAbertas(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => {
      window.removeEventListener("saspi_user_updated", carregarUsuario);
      window.removeEventListener("saspi_elderly_updated", carregarNotificacoes);
      window.removeEventListener("storage", carregarUsuario);
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, [carregarUsuario, carregarNotificacoes]);

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
  const qtdCriticas = notificacoes.filter((n) => n.critico).length;

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

        <div className="flex items-center gap-2">
          {/* SINO DE NOTIFICAÇÕES E ALERTAS */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificacoesAbertas((prev) => !prev)}
              aria-label="Notificações e Alertas"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-gray-50/70 text-gray-600 transition hover:bg-[#E8F1FB] hover:text-[#1565C0]"
            >
              <Bell size={19} />
              {notificacoes.length > 0 && (
                <span
                  className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm ${
                    qtdCriticas > 0 ? "bg-red-600" : "bg-[#1565C0]"
                  }`}
                >
                  {notificacoes.length}
                </span>
              )}
            </button>

            {notificacoesAbertas && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-4 py-3">
                  <span className="text-sm font-bold text-[#0A2540]">
                    Notificações e Alertas ({notificacoes.length})
                  </span>
                  {qtdCriticas > 0 && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                      {qtdCriticas} alerta(s) clínico(s)
                    </span>
                  )}
                </div>

                <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                  {notificacoes.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                      Nenhuma notificação ou alerta pendente no momento.
                    </div>
                  ) : (
                    notificacoes.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setNotificacoesAbertas(false)}
                        className={`flex items-start gap-3 p-4 transition hover:bg-gray-50 ${
                          n.critico ? "bg-red-50/40" : ""
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            n.tipo === "alerta_clinico"
                              ? "bg-red-100 text-red-600"
                              : n.tipo === "vinculo"
                                ? "bg-[#E8F1FB] text-[#1565C0]"
                                : "bg-[#E6F4EF] text-[#26A69A]"
                          }`}
                        >
                          {n.tipo === "alerta_clinico" ? (
                            <AlertTriangle size={16} />
                          ) : n.tipo === "vinculo" ? (
                            <UserCheck size={16} />
                          ) : (
                            <CalendarDays size={16} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-bold ${
                              n.critico ? "text-red-700" : "text-[#0A2540]"
                            }`}
                          >
                            {n.titulo}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-600">
                            {n.descricao}
                          </p>
                          {n.dataHora && (
                            <p className="mt-1 text-[11px] text-gray-400">
                              Registrado em {n.dataHora}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MENU DO USUÁRIO */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownAberto((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-gray-50"
              aria-expanded={dropdownAberto}
            >
              {usuario ? (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    usuario.nome
                  )}&background=1565C0&color=fff&size=64&bold=true`}
                  alt={usuario.nome}
                  className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm"
                />
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

          {/* BOTÃO HAMBÚRGUER PARA NAVEGAÇÃO MOBILE (RNF04) */}
          <button
            type="button"
            onClick={() => setMenuMobileAberto((prev) => !prev)}
            aria-label={menuMobileAberto ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={menuMobileAberto}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-gray-50/70 text-[#0A2540] transition hover:bg-[#E8F1FB] hover:text-[#1565C0] md:hidden"
          >
            {menuMobileAberto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MENU DE NAVEGAÇÃO MOBILE RECOLHÍVEL */}
      {menuMobileAberto && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 shadow-sm md:hidden">
          <nav className="flex flex-col gap-1">
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
                  onClick={() => setMenuMobileAberto(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    ativo
                      ? "bg-[#E8F1FB] text-[#1565C0]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#0A2540]"
                  }`}
                >
                  <Icon size={17} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}