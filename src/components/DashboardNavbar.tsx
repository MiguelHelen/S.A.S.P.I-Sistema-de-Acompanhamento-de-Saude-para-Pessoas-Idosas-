"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { gerarAlertasClinicos } from "@/components/MetricCard";
import {
  API_URL,
  UsuarioSessao,
  buscarClinicaPorIdNoBackend,
  getAuthHeaders,
  getClinicaDados,
  getTokenSessao,
  getUsuarioSessao,
  isAdminPerfil,
  limparSessao,
  salvarUsuarioSessao,
} from "@/lib/clinica";
import {
  Activity,
  HeartPulse,
  Pill,
  CalendarDays,
  History,
  User,
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
  CheckCheck,
  Info,
} from "lucide-react";

export interface NotificacaoSistema {
  id: string;
  tipo: "alerta_clinico" | "vinculo" | "consulta" | "institucional";
  titulo: string;
  descricao: string;
  dataHora?: string;
  href: string;
  critico?: boolean;
}

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
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [nomeClinica, setNomeClinica] = useState<string>("");
  const [buscandoClinica, setBuscandoClinica] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoSistema[]>([]);
  const [notificacoesLidas, setNotificacoesLidas] = useState<string[]>([]);

  const carregarNotificacoes = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = getTokenSessao();
    const sessao = getUsuarioSessao();
    if (!token || !sessao?.id) {
      setNotificacoes([]);
      return;
    }

    const userId = sessao.id;
    const lidasStorage = localStorage.getItem(`saspi_notif_lidas_${userId}`);
    if (lidasStorage) {
      try {
        setNotificacoesLidas(JSON.parse(lidasStorage));
      } catch {}
    } else {
      setNotificacoesLidas([]);
    }

    const headers = getAuthHeaders();
    const listaNotif: NotificacaoSistema[] = [];

    try {
      const avisosRaw = localStorage.getItem(
        `saspi_avisos_clinica_${sessao.clinica_id || "geral"}`
      );
      if (avisosRaw) {
        const avisosLocais = JSON.parse(avisosRaw);
        if (Array.isArray(avisosLocais)) {
          avisosLocais.forEach((av: NotificacaoSistema) => listaNotif.push(av));
        }
      }
    } catch {}

    try {
      if (isAdminPerfil(sessao.perfil)) {
        const [resVinc, resUsers] = await Promise.all([
          fetch(`${API_URL}/usuario-idoso`, { headers }).catch(() => null),
          fetch(
            `${API_URL}/usuario?clinica_id=${sessao.clinica_id || ""}`,
            { headers }
          ).catch(() => null),
        ]);

        if (resUsers?.ok) {
          const users = await resUsers.json();
          if (Array.isArray(users)) {
            const pendentes = users.filter(
              (u: any) => String(u.status || "").toUpperCase() === "PENDENTE"
            );
            if (pendentes.length > 0) {
              listaNotif.push({
                id: `convites-pendentes-${pendentes.length}`,
                tipo: "institucional",
                titulo: `${pendentes.length} convite(s) aguardando ativação`,
                descricao: `Há membro(s) da equipe ou familiares que ainda não definiram a senha de acesso.`,
                href: "/dashboard/usuarios",
              });
            }
          }
        }

        if (resVinc?.ok) {
          const vincs = await resVinc.json();
          if (Array.isArray(vincs)) {
            vincs.slice(0, 5).forEach((v: any) => {
              if (v.usuario?.nome && v.idoso?.nome) {
                listaNotif.push({
                  id: `vinc-adm-${v.id}`,
                  tipo: "vinculo",
                  titulo: "Vínculo Institucional Ativo",
                  descricao: `${v.usuario.nome} agora acompanha ${v.idoso.nome} (${formatarPapelVinculo(v.tipo_vinculo)}).`,
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

      const dadosClinica = getClinicaDados();
      if (dadosClinica.nome) {
        listaNotif.push({
          id: `unidade-atual-${sessao.clinica_id}-${dadosClinica.nome}`,
          tipo: "institucional",
          titulo: "Unidade Institucional Conectada",
          descricao: `Você faz parte da equipe vinculada à unidade ${dadosClinica.nome}.`,
          href: "/dashboard/perfil",
        });
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
          fetch(`${API_URL}/consulta/idoso/${idosoAtivo.id}`, {
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
          const consRaw = await resCons.json();
          const cons = Array.isArray(consRaw) ? consRaw : consRaw?.data || [];
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
                descricao: `Agora você acompanha ${v.idoso.nome} como ${formatarPapelVinculo(v.tipo_vinculo)}.`,
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

  const carregarUsuario = useCallback(async () => {
    const token = getTokenSessao();
    const sessao = getUsuarioSessao();

    if (!token || !sessao) {
      setUsuario(null);
      setNomeClinica("");
      return;
    }

    setUsuario(sessao);

    const dadosLocais = getClinicaDados();
    if (dadosLocais.nome) {
      setNomeClinica(dadosLocais.nome);
      return;
    }

    if (sessao.clinica_id) {
      setBuscandoClinica(true);
      try {
        const clinicaBackend = await buscarClinicaPorIdNoBackend(
          sessao.clinica_id
        );
        if (clinicaBackend?.nome) {
          setNomeClinica(clinicaBackend.nome);
          salvarUsuarioSessao({ clinica_nome: clinicaBackend.nome });
        }
      } finally {
        setBuscandoClinica(false);
      }
    }
  }, []);

  useEffect(() => {
    carregarUsuario();
    carregarNotificacoes();

    function handleUserUpdated() {
      carregarUsuario();
      carregarNotificacoes();
    }

    function handleStorageEntreAbas(event: StorageEvent) {
      if (event.key === "saspi_token" && !event.newValue) {
        setUsuario(null);
        window.location.href = "/login";
        return;
      }

      if (
        !event.key ||
        event.key === "saspi_user" ||
        event.key === "saspi_token"
      ) {
        carregarUsuario();
      }

      if (
        !event.key ||
        event.key === "saspi_active_elderly" ||
        event.key === "saspi_user" ||
        event.key.startsWith("saspi_notif_lidas_")
      ) {
        carregarNotificacoes();
      }
    }

    window.addEventListener("saspi_user_updated", handleUserUpdated);
    window.addEventListener("saspi_elderly_updated", carregarNotificacoes);
    window.addEventListener("saspi_notif_updated", carregarNotificacoes);
    window.addEventListener("saspi_alerta_clinico", carregarNotificacoes);
    window.addEventListener("storage", handleStorageEntreAbas);

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
      window.removeEventListener("saspi_user_updated", handleUserUpdated);
      window.removeEventListener("saspi_elderly_updated", carregarNotificacoes);
      window.removeEventListener("saspi_notif_updated", carregarNotificacoes);
      window.removeEventListener("saspi_alerta_clinico", carregarNotificacoes);
      window.removeEventListener("storage", handleStorageEntreAbas);
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, [carregarUsuario, carregarNotificacoes]);

  useEffect(() => {
    const token = getTokenSessao();
    const sessao = getUsuarioSessao();
    if (!token || !sessao?.id || isAdminPerfil(sessao.perfil)) return;

    const socket: Socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      try {
        const raw = localStorage.getItem("saspi_active_elderly");
        const ativo = raw ? JSON.parse(raw) : null;
        if (ativo?.id) {
          socket.emit("entrar-sala-idoso", ativo.id);
        }
      } catch {}
    });

    socket.on("alerta-saude", (payload: any) => {
      const texto =
        payload?.mensagem ||
        payload?.msg ||
        "Indicador clínico fora do padrão seguro.";
      const novoAlerta: NotificacaoSistema = {
        id: `alerta-rt-${Date.now()}-${Math.random()}`,
        tipo: "alerta_clinico",
        titulo: "Alerta Clínico Crítico",
        descricao: texto,
        dataHora: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        href: "/dashboard/saude",
        critico: true,
      };
      setNotificacoes((prev) => [novoAlerta, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [usuario?.id, usuario?.perfil, pathname]);

  function handleLogout() {
    setDropdownAberto(false);
    setMenuMobileAberto(false);

    localStorage.removeItem("saspi_token");
    localStorage.removeItem("saspi_user");
    localStorage.removeItem("saspi_active_elderly");
    localStorage.removeItem("saspi_elderly_list");

    document.cookie = "saspi_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "saspi_user=; path=/; max-age=0; SameSite=Lax";

    limparSessao();
    window.location.href = "/login";
  }

  function marcarComoLida(id: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!usuario?.id) return;

    const novasLidas = [...notificacoesLidas, id];
    setNotificacoesLidas(novasLidas);
    localStorage.setItem(
      `saspi_notif_lidas_${usuario.id}`,
      JSON.stringify(novasLidas)
    );
  }

  function marcarTodasComoLidas() {
    if (!usuario?.id) return;
    const todosIds = notificacoes.map((n) => n.id);
    setNotificacoesLidas(todosIds);
    localStorage.setItem(
      `saspi_notif_lidas_${usuario.id}`,
      JSON.stringify(todosIds)
    );
  }

  const isAdmin = isAdminPerfil(usuario?.perfil);
  const navLinksAtivos = isAdmin ? ADMIN_NAV_LINKS : CLINICAL_NAV_LINKS;

  const notificacoesNaoLidas = notificacoes.filter(
    (n) => !notificacoesLidas.includes(n.id)
  );
  const qtdCriticas = notificacoesNaoLidas.filter((n) => n.critico).length;

  const avatarUrl =
    usuario?.foto_url ||
    (usuario?.nome
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
          usuario.nome
        )}&background=1565C0&color=fff&size=64&bold=true`
      : "");

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white shadow-[0_2px_12px_rgba(10,37,64,0.03)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-3.5">
          <Link
            href="/dashboard"
            prefetch={false}
            className="group flex items-center rounded-xl transition-transform duration-200 hover:scale-[1.02]"
          >
            <Image
              src="/logo.png"
              alt="S.A.S.P.I."
              width={160}
              height={42}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          {(nomeClinica || buscandoClinica) && (
            <div className="hidden items-center gap-2 rounded-xl border border-[#DCEAF8] bg-linear-to-r from-[#F4F9FE] to-[#EDF7F5] px-3 py-1.5 shadow-2xs sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1565C0]/10 text-[#1565C0]">
                <Building2 size={13} />
              </span>
              {buscandoClinica && !nomeClinica ? (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin text-[#1565C0]" />
                  Carregando unidade...
                </span>
              ) : (
                <div className="leading-tight">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#26A69A]">
                    Unidade
                  </span>
                  <span className="block max-w-45 truncate text-xs font-bold text-[#0A2540]">
                    {nomeClinica}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-1.5 md:flex">
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
                prefetch={false}
                className={`group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  ativo
                    ? "bg-[#E8F1FB]/85 font-semibold text-[#1565C0]"
                    : "text-gray-600 hover:bg-[#F2F7FB] hover:text-[#0A2540]"
                }`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                <span
                  className={`absolute bottom-1 left-3.5 right-3.5 h-0.5 origin-left rounded-full bg-[#1565C0] transition-transform duration-200 ${
                    ativo ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificacoesAbertas((prev) => !prev)}
              aria-label="Notificações e Alertas"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-[#F8FBFE] text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-[#E8F1FB] hover:text-[#1565C0]"
            >
              <Bell size={19} />
              {notificacoesNaoLidas.length > 0 && (
                <span
                  className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm ${
                    qtdCriticas > 0 ? "bg-red-600" : "bg-[#1565C0]"
                  }`}
                >
                  {notificacoesNaoLidas.length}
                </span>
              )}
            </button>

            {notificacoesAbertas && (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 sm:w-105">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                  <span className="text-sm font-bold text-[#0A2540]">
                    Avisos e Alertas ({notificacoesNaoLidas.length})
                  </span>
                  <div className="flex items-center gap-3">
                    {qtdCriticas > 0 && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                        {qtdCriticas} clínico(s)
                      </span>
                    )}
                    {notificacoesNaoLidas.length > 0 && (
                      <button
                        type="button"
                        onClick={marcarTodasComoLidas}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#1565C0] transition hover:text-[#0A2540]"
                        title="Marcar todas como lidas"
                      >
                        <CheckCheck size={14} />
                        Lidas
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-87.5 divide-y divide-gray-100 overflow-y-auto">
                  {notificacoesNaoLidas.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCheck size={24} />
                      </div>
                      <p className="text-sm font-medium text-[#0A2540]">
                        Tudo em dia!
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Nenhum aviso ou alerta pendente no momento.
                      </p>
                    </div>
                  ) : (
                    notificacoesNaoLidas.map((n) => (
                      <div key={n.id} className="group relative">
                        <Link
                          href={n.href}
                          prefetch={false}
                          onClick={() => {
                            setNotificacoesAbertas(false);
                            if (!notificacoesLidas.includes(n.id)) {
                              const novasLidas = [...notificacoesLidas, n.id];
                              setNotificacoesLidas(novasLidas);
                              if (usuario?.id) {
                                localStorage.setItem(
                                  `saspi_notif_lidas_${usuario.id}`,
                                  JSON.stringify(novasLidas)
                                );
                              }
                            }
                          }}
                          className={`flex items-start gap-3 p-4 pr-10 transition hover:bg-gray-50 ${
                            n.critico ? "bg-red-50/40" : ""
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              n.tipo === "alerta_clinico"
                                ? "bg-red-100 text-red-600"
                                : n.tipo === "vinculo"
                                  ? "bg-[#E8F1FB] text-[#1565C0]"
                                  : n.tipo === "institucional"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-[#E6F4EF] text-[#26A69A]"
                            }`}
                          >
                            {n.tipo === "alerta_clinico" ? (
                              <AlertTriangle size={16} />
                            ) : n.tipo === "vinculo" ? (
                              <UserCheck size={16} />
                            ) : n.tipo === "institucional" ? (
                              <Info size={16} />
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
                                {n.dataHora}
                              </p>
                            )}
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => marcarComoLida(n.id, e)}
                          className="absolute right-3 top-4 rounded-md p-1.5 text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                          title="Descartar aviso"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownAberto((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-all duration-200 hover:border-gray-200 hover:bg-[#F8FBFE]"
              aria-expanded={dropdownAberto}
            >
              {usuario ? (
                <img
                  src={avatarUrl}
                  alt={usuario.nome}
                  className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-[#E8F1FB]"
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
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">
                      {usuario.perfil}
                    </p>
                  </>
                )}
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  dropdownAberto ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownAberto && usuario && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg ring-1 ring-black/5">
                <div className="border-b border-gray-100 px-3 py-2 md:hidden">
                  <p className="text-sm font-semibold text-[#0A2540]">
                    {usuario.nome}
                  </p>
                  <p className="text-xs text-gray-500">{usuario.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/perfil"
                    prefetch={false}
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
                        prefetch={false}
                        onClick={() => setDropdownAberto(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                      >
                        <Users size={16} className="text-[#1565C0]" />
                        Gerenciar Usuários
                      </Link>

                      <Link
                        href="/dashboard/idosos"
                        prefetch={false}
                        onClick={() => setDropdownAberto(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                      >
                        <HeartHandshake size={16} className="text-[#26A69A]" />
                        Gerenciar Idosos
                      </Link>

                      <Link
                        href="/dashboard/vinculos"
                        prefetch={false}
                        onClick={() => setDropdownAberto(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                      >
                        <Link2 size={16} className="text-[#1565C0]" />
                        Gerenciar Vínculos
                      </Link>

                      <Link
                        href="/dashboard/clinica"
                        prefetch={false}
                        onClick={() => setDropdownAberto(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-[#F2F7FB] hover:text-[#1565C0]"
                      >
                        <Building2 size={16} className="text-[#1565C0]" />
                        Dados da Clínica
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

          <button
            type="button"
            onClick={() => setMenuMobileAberto((prev) => !prev)}
            aria-label="Abrir menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#0A2540] transition hover:bg-gray-50 md:hidden"
          >
            {menuMobileAberto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuMobileAberto && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 shadow-lg md:hidden">
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
                  prefetch={false}
                  onClick={() => setMenuMobileAberto(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    ativo
                      ? "bg-[#E8F1FB] font-semibold text-[#1565C0]"
                      : "text-gray-600 hover:bg-[#F2F7FB] hover:text-[#0A2540]"
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