"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import DashboardNavbar from "@/components/DashboardNavbar";
import MetricCard, {
  avaliarIndicadorClinico,
  gerarAlertasClinicos,
} from "@/components/MetricCard";
import InfoCard from "@/components/InfoCard";
import HealthChart, { PontoGraficoSaude } from "@/components/HealthChart";
import PatientSelector, {
  Idoso,
  formatarCpf,
  formatarDataBr,
  formatarSexo,
} from "@/components/PatientSelector";
import {
  API_URL,
  getUsuarioSessao,
  getTokenSessao,
  getAuthHeaders,
} from "@/lib/clinica";
import {
  HeartPulse,
  Activity,
  Pill,
  CalendarDays,
  UserPlus,
  Users,
  Building2,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  UserCheck,
  Loader2,
  Link2,
  AlertTriangle,
  MapPin,
  Phone,
  Calendar,
  FileText,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [semClinica, setSemClinica] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    nome: string;
    email: string;
    perfil: string;
    clinica_id: string;
    foto_url?: string;
  }>({
    id: "",
    nome: "",
    email: "",
    perfil: "",
    clinica_id: "",
    foto_url: "",
  });

  const [contadoresAdmin, setContadoresAdmin] = useState({
    usuarios: 0,
    idosos: 0,
    vinculos: 0,
  });

  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [pontosGrafico, setPontosGrafico] = useState<PontoGraficoSaude[]>([]);
  const [alertasEmergencia, setAlertasEmergencia] = useState<
    { id: number; msg: string }[]
  >([]);

  const [resumoClinico, setResumoClinico] = useState({
    fc: "--",
    spo2: "--",
    temp: "--",
    pa: "--/--",
    proximoMedTitulo: "Nenhuma prescrição ativa",
    proximoMedSub: "Sem agendamento",
    proximaConsultaTitulo: "Sem agendamento",
    proximaConsultaSub: "Consulte a agenda clínica",
  });

  const handleSelectIdoso = useCallback((idoso: Idoso) => {
    setIdosoAtivo((prev) => (prev?.id === idoso.id ? prev : idoso));
  }, []);

  const carregarUsuario = useCallback(() => {
    const token = getTokenSessao();
    const sessao = getUsuarioSessao();

    if (!token || !sessao) {
      setCarregandoSessao(false);
      router.push("/login");
      return;
    }

    setUser({
      id: sessao.id,
      nome: sessao.nome || "Profissional",
      email: sessao.email || "",
      perfil: sessao.perfil,
      clinica_id: sessao.clinica_id,
      foto_url: sessao.foto_url || "",
    });

    setSemClinica(!sessao.clinica_id);

    const savedElderly = localStorage.getItem("saspi_active_elderly");
    if (savedElderly) {
      try {
        setIdosoAtivo(JSON.parse(savedElderly));
      } catch {}
    }
    setCarregandoSessao(false);
  }, [router]);

  useEffect(() => {
    carregarUsuario();

    function atualizarIdosoAtivo() {
      const savedElderly = localStorage.getItem("saspi_active_elderly");
      if (savedElderly) {
        try {
          const parsed = JSON.parse(savedElderly);
          setIdosoAtivo(parsed);
          setAlertasEmergencia([]);
        } catch {}
      } else {
        setIdosoAtivo(null);
        setAlertasEmergencia([]);
      }
    }

    window.addEventListener("storage", carregarUsuario);
    window.addEventListener("saspi_user_updated", carregarUsuario);
    window.addEventListener("saspi_elderly_updated", atualizarIdosoAtivo);

    return () => {
      window.removeEventListener("storage", carregarUsuario);
      window.removeEventListener("saspi_user_updated", carregarUsuario);
      window.removeEventListener("saspi_elderly_updated", atualizarIdosoAtivo);
    };
  }, [carregarUsuario]);

  const perfilUpper = user.perfil;
  const isAdmin = perfilUpper === "ADMINISTRADOR" || perfilUpper === "ADMIN";
  const isMedico = perfilUpper === "MEDICO";
  const isLeituraSomente = perfilUpper === "FAMILIAR";

  useEffect(() => {
    if (!isAdmin || !user.clinica_id) return;
    const headers = getAuthHeaders();

    Promise.all([
      fetch(`${API_URL}/usuario?clinica_id=${user.clinica_id}`, {
        headers,
      }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/idoso?clinica_id=${user.clinica_id}`, {
        headers,
      }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/usuario-idoso?clinica_id=${user.clinica_id}`, {
        headers,
      }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([uList, iList, vList]) => {
        const usuariosClinica = Array.isArray(uList)
          ? uList.filter(
              (u: any) => !u.clinica_id || u.clinica_id === user.clinica_id
            )
          : [];
        const idososClinica = Array.isArray(iList)
          ? iList.filter(
              (i: any) => !i.clinica_id || i.clinica_id === user.clinica_id
            )
          : [];
        const idsIdososClinica = new Set(
          idososClinica.map((i: any) => i.id)
        );
        const vinculosClinica = Array.isArray(vList)
          ? vList.filter((v: any) => {
              const iId = v.idoso_id || v.idosoId || v.idoso?.id;
              return !iId || idsIdososClinica.has(iId);
            })
          : [];

        setContadoresAdmin({
          usuarios: usuariosClinica.length,
          idosos: idososClinica.length,
          vinculos: vinculosClinica.length,
        });
      })
      .catch(() => {});
  }, [isAdmin, user.clinica_id]);

  useEffect(() => {
    async function carregarResumoPaciente(idosoId: string) {
      const headers = getAuthHeaders();

      try {
        const [resReg, resPresc, resCons] = await Promise.all([
          fetch(`${API_URL}/registro-saude/idoso/${idosoId}`, {
            headers,
          }).catch(() => null),
          fetch(`${API_URL}/prescricao/idoso/${idosoId}`, {
            headers,
          }).catch(() => null),
          fetch(`${API_URL}/consulta?idoso_id=${idosoId}`, {
            headers,
          }).catch(() => null),
        ]);

        let fcVal = "--";
        let spo2Val = "--";
        let tempVal = "--";
        let paVal = "--/--";
        let medTitulo = "Nenhuma prescrição ativa";
        let medSub = "Sem agendamento";
        let consTitulo = "Sem agendamento";
        let consSub = "Consulte a agenda clínica";
        const serieFc: PontoGraficoSaude[] = [];

        if (resReg?.ok) {
          const regs = await resReg.json();
          if (Array.isArray(regs)) {
            regs.forEach((r: any) => {
              const nomeInd = String(
                r.indicador_saude?.nome || r.indicador_nome || ""
              ).toLowerCase();
              const valBruto = String(
                r.valor_numerico ?? r.valor_categorico ?? r.valor ?? "--"
              );

              if (nomeInd.includes("card")) {
                if (fcVal === "--") fcVal = valBruto;
                const num = Number(r.valor_numerico ?? r.valor);
                if (!Number.isNaN(num) && serieFc.length < 20) {
                  const dt = r.data_hora || r.created_at;
                  const hora = dt
                    ? new Date(dt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recente";
                  serieFc.push({ horario: hora, valor: num });
                }
              } else if (nomeInd.includes("oxig") || nomeInd.includes("spo")) {
                if (spo2Val === "--") spo2Val = valBruto;
              } else if (nomeInd.includes("temp")) {
                if (tempVal === "--") tempVal = valBruto;
              } else if (nomeInd.includes("press")) {
                if (paVal === "--/--") paVal = valBruto;
              }
            });
          }
        }

        if (resPresc?.ok) {
          const prescs = await resPresc.json();
          if (Array.isArray(prescs) && prescs.length > 0) {
            const ativas = prescs.filter(
              (p: any) => String(p.status || "ATIVA").toUpperCase() === "ATIVA"
            );
            if (ativas.length > 0) {
              const p = ativas[0];
              medTitulo = p.medicamento?.nome || "Medicação Prescrita";
              medSub = `${p.dosagem || ""} • ${p.frequencia || "Uso contínuo"}`;
            }
          }
        }

        if (resCons?.ok) {
          const consultas = await resCons.json();
          if (Array.isArray(consultas) && consultas.length > 0) {
            const ativas = consultas.filter(
              (c: any) =>
                c.status !== "Cancelada" && c.status !== "Realizada"
            );
            if (ativas.length > 0) {
              const c = ativas[0];
              const dataBr = c.data
                ? new Date(c.data).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })
                : "";
              consTitulo = c.especialidade;
              consSub = `${dataBr} às ${c.horario || ""} • ${c.medico || ""}`;
            }
          }
        }

        setPontosGrafico(serieFc.reverse());
        setResumoClinico({
          fc: fcVal,
          spo2: spo2Val,
          temp: tempVal,
          pa: paVal,
          proximoMedTitulo: medTitulo,
          proximoMedSub: medSub,
          proximaConsultaTitulo: consTitulo,
          proximaConsultaSub: consSub,
        });
      } catch {}
    }

    if (idosoAtivo?.id && !isAdmin) {
      carregarResumoPaciente(idosoAtivo.id);
    }
  }, [idosoAtivo?.id, isAdmin]);

  useEffect(() => {
    if (!idosoAtivo?.id || isAdmin) return;

    const token = getTokenSessao();
    if (!token) return;

    const socket: Socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("entrar-sala-idoso", idosoAtivo.id);
    });

    socket.on("novo-registro-saude", (registro: any) => {
      if (registro?.idoso_id && registro.idoso_id !== idosoAtivo.id) return;

      const nomeInd = String(
        registro?.indicador_saude?.nome || registro?.indicador_nome || ""
      ).toLowerCase();
      const valBruto = String(
        registro?.valor_numerico ??
          registro?.valor_categorico ??
          registro?.valor ??
          "--"
      );

      setResumoClinico((prev) => {
        const novoResumo = { ...prev };
        if (nomeInd.includes("card")) {
          novoResumo.fc = valBruto;
          const num = Number(registro?.valor_numerico ?? registro?.valor);
          if (!Number.isNaN(num)) {
            const hora = new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            setPontosGrafico((graficoPrev) =>
              [...graficoPrev, { horario: hora, valor: num }].slice(-20)
            );
          }
        } else if (nomeInd.includes("oxig") || nomeInd.includes("spo")) {
          novoResumo.spo2 = valBruto;
        } else if (nomeInd.includes("temp")) {
          novoResumo.temp = valBruto;
        } else if (nomeInd.includes("press")) {
          novoResumo.pa = valBruto;
        }
        return novoResumo;
      });

      window.dispatchEvent(new Event("saspi_elderly_updated"));
    });

    socket.on(
      "alerta-saude",
      (data: { mensagem?: string; msg?: string; idoso_id?: string }) => {
        if (data?.idoso_id && data.idoso_id !== idosoAtivo.id) return;
        const textoAlerta =
          data?.mensagem || data?.msg || "Alerta crítico de saúde.";
        setAlertasEmergencia((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), msg: textoAlerta },
        ]);
        window.dispatchEvent(new Event("saspi_elderly_updated"));
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [idosoAtivo?.id, isAdmin]);

  function obterSaudacao() {
    const primeiroNome =
      user.nome && !user.nome.includes("@")
        ? user.nome.trim().split(" ")[0]
        : "Profissional";

    if (isAdmin) return `Olá, ${primeiroNome}!`;
    if (perfilUpper === "MEDICO") return `Olá, Dr(a). ${primeiroNome}!`;
    if (perfilUpper === "ENFERMEIRO") return `Olá, Enf. ${primeiroNome}!`;
    if (perfilUpper === "CUIDADOR") return `Olá, Cuidador(a) ${primeiroNome}!`;
    if (perfilUpper === "FAMILIAR") return `Olá, ${primeiroNome}!`;
    return `Olá, ${primeiroNome}!`;
  }

  const avatarProfissional =
    user.foto_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.nome || "Profissional"
    )}&background=1565C0&color=fff&size=96&bold=true`;

  const avaliacaoFc = avaliarIndicadorClinico("fc", resumoClinico.fc);
  const avaliacaoSpo2 = avaliarIndicadorClinico("spo2", resumoClinico.spo2);
  const alertasAtivos = gerarAlertasClinicos({
    fc: resumoClinico.fc,
    spo2: resumoClinico.spo2,
    temp: resumoClinico.temp,
    pa: resumoClinico.pa,
  });

  if (carregandoSessao) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="flex h-96 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#1565C0]" />
        </div>
      </main>
    );
  }

  if (semClinica) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <AlertTriangle size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#0A2540]">
            Clínica Não Vinculada
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Não foi possível identificar uma unidade clínica vinculada à sua
            sessão. Entre em contato com o administrador ou acesse novamente.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              {isAdmin
                ? "Painel Administrativo"
                : isLeituraSomente
                  ? "Acompanhamento Familiar (Somente Leitura)"
                  : "Acompanhamento Clínico Assistencial"}
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              {obterSaudacao()}
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              {isAdmin
                ? "Gestão institucional de profissionais, cuidadores, familiares e idosos do S.A.S.P.I."
                : idosoAtivo
                  ? `Acompanhamento em tempo real dos sinais vitais e da rotina de ${idosoAtivo.nome}.`
                  : "Selecione um paciente vinculado para iniciar o monitoramento."}
            </p>
          </div>

          {isAdmin ? (
            <Link
              href="/dashboard/usuarios/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <UserPlus size={18} />
              Novo Usuário
            </Link>
          ) : (
            <Link
              href="/dashboard/perfil"
              title="Visualizar ou editar meu perfil"
              className="flex items-center gap-3 self-start rounded-2xl border border-gray-200/80 bg-white px-3.5 py-2.5 shadow-xs transition hover:border-[#BFD8F2] hover:shadow-sm sm:self-auto"
            >
              <img
                src={avatarProfissional}
                alt={user.nome}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#E8F1FB]"
              />
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-[#0A2540]">
                    {user.nome}
                  </p>
                  <span className="rounded-md bg-[#E8F1FB] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1565C0]">
                    {user.perfil}
                  </span>
                </div>
                {user.email && (
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {user.email}
                  </p>
                )}
              </div>
            </Link>
          )}
        </div>

        {isAdmin ? (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/dashboard/usuarios"
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#BFD8F2] hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Users size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Equipe e Usuários
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">
                  {contadoresAdmin.usuarios} cadastrados
                </p>
              </Link>

              <Link
                href="/dashboard/idosos"
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#BFD8F2] hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ClipboardList size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Idosos Registrados
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">
                  {contadoresAdmin.idosos} pacientes
                </p>
              </Link>

              <Link
                href="/dashboard/vinculos"
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#BFD8F2] hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <UserCheck size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Rede de Apoio Ativa
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0A2540]">
                  {contadoresAdmin.vinculos} vínculos
                </p>
              </Link>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <ShieldCheck size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Nível de Acesso
                </p>
                <p className="mt-1 text-xl font-bold text-[#20877E]">
                  {user.perfil || "ADMINISTRADOR"}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Ações de Gestão Institucional
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie usuários, pacientes e vínculos de acesso da clínica.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/dashboard/usuarios"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                      <Users size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Gerenciar Usuários
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Listar, cadastrar, editar ou remover membros da equipe e
                    familiares.
                  </p>
                </Link>

                <Link
                  href="/dashboard/idosos"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                      <ClipboardList size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Gerenciar Pacientes (Idosos)
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Listar, admitir novos idosos, atualizar dados cadastrais e
                    acesso ao aplicativo.
                  </p>
                </Link>

                <Link
                  href="/dashboard/vinculos"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                      <Link2 size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Gerenciar Vínculos
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Associar ou revogar o vínculo entre profissionais, familiares
                    e idosos.
                  </p>
                </Link>

                <Link
                  href="/dashboard/usuarios/novo"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                      <UserPlus size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Cadastrar Novo Usuário
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Criar nova credencial de acesso para a instituição.
                  </p>
                </Link>

                <Link
                  href="/dashboard/vinculos/novo"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                      <UserCheck size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Novo Vínculo
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Atribuir um paciente a um médico, enfermeiro, cuidador ou
                    familiar.
                  </p>
                </Link>

                <Link
                  href="/dashboard/clinica"
                  className="group rounded-xl border border-gray-200 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                      <Building2 size={20} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#1565C0]"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Dados da Clínica
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Gerenciar razão social, CNPJ, contato e endereço.
                  </p>
                </Link>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <PatientSelector
              onSelect={handleSelectIdoso}
              selectedId={idosoAtivo?.id}
            />

            {idosoAtivo ? (
              <>
                {(alertasAtivos.length > 0 || alertasEmergencia.length > 0) && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/90 p-5 shadow-sm animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <AlertTriangle size={22} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-red-800">
                          Atenção Clínica — Indicadores fora do padrão seguro
                        </h2>
                        <ul className="mt-2 space-y-1.5 text-sm text-red-700">
                          {alertasAtivos.map((al) => (
                            <li key={al.id} className="flex flex-wrap gap-1.5">
                              <strong>• {al.indicador}:</strong>
                              <span>{al.mensagem}</span>
                              <span className="text-xs text-red-600/80">
                                ({al.referencia})
                              </span>
                            </li>
                          ))}
                          {alertasEmergencia.map((al) => (
                            <li key={al.id} className="flex flex-wrap gap-1.5">
                              <strong>• EVENTO CRÍTICO:</strong>
                              <span>{al.msg}</span>
                              <span className="text-xs text-red-600/80">
                                (Acabou de ocorrer)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Frequência Cardíaca"
                    value={resumoClinico.fc}
                    unit="bpm"
                    icon={<HeartPulse size={22} />}
                    statusLabel={avaliacaoFc.label}
                    statusTone={avaliacaoFc.tone}
                  />

                  <MetricCard
                    title="Oxigenação (SpO2)"
                    value={resumoClinico.spo2}
                    unit="%"
                    icon={<Activity size={22} />}
                    statusLabel={avaliacaoSpo2.label}
                    statusTone={avaliacaoSpo2.tone}
                  />

                  <InfoCard
                    label="Próximo Medicamento"
                    title={resumoClinico.proximoMedTitulo}
                    subtitle={resumoClinico.proximoMedSub}
                    icon={<Pill size={22} />}
                  />

                  <InfoCard
                    label="Próxima Consulta"
                    title={resumoClinico.proximaConsultaTitulo}
                    subtitle={resumoClinico.proximaConsultaSub}
                    icon={<CalendarDays size={22} />}
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-[#0A2540]">
                          Evolução dos Sinais Vitais — {idosoAtivo.nome}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Monitoramento contínuo das últimas aferições
                        </p>
                      </div>

                      <Link
                        href="/dashboard/saude"
                        className="text-sm font-medium text-[#1565C0] hover:underline"
                      >
                        Ver histórico detalhado
                      </Link>
                    </div>

                    {pontosGrafico.length > 0 ? (
                      <div className="mt-6">
                        <HealthChart dados={pontosGrafico} />
                        <p className="mt-3 text-center text-xs text-gray-500">
                          Última aferição sincronizada: FC {resumoClinico.fc}{" "}
                          bpm | SpO₂ {resumoClinico.spo2}%
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                        <Activity size={32} className="text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-[#0A2540]">
                          {resumoClinico.fc !== "--" ||
                          resumoClinico.spo2 !== "--"
                            ? `Última aferição sincronizada: FC ${resumoClinico.fc} bpm | SpO₂ ${resumoClinico.spo2}%`
                            : "Nenhum registro de telemetria recente"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Os dados são atualizados conforme sincronização do
                          dispositivo vestível ou aferição manual.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#0A2540]">
                      Prescrições e Alertas
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Rotina de {idosoAtivo.nome}
                    </p>

                    <div className="mt-6 space-y-4">
                      {alertasAtivos.map((al) => (
                        <div
                          key={al.id}
                          className="rounded-xl border border-red-200 bg-red-50/70 p-4"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-700">
                            <AlertTriangle size={15} />
                            Alerta: {al.indicador} ({al.valorFormatado})
                          </div>
                          <p className="mt-1 text-xs text-red-600">
                            {al.mensagem}
                          </p>
                        </div>
                      ))}

                      {alertasEmergencia.map((al) => (
                        <div
                          key={al.id}
                          className="rounded-xl border border-red-300 bg-red-100 p-4 animate-bounce"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-800">
                            <AlertTriangle size={15} />
                            ALERTA CRÍTICO
                          </div>
                          <p className="mt-1 text-xs font-semibold text-red-700">
                            {al.msg}
                          </p>
                        </div>
                      ))}

                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5 text-center">
                        <Pill size={24} className="mx-auto text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-600">
                          {resumoClinico.proximoMedTitulo}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {resumoClinico.proximoMedTitulo !==
                          "Nenhuma prescrição ativa"
                            ? resumoClinico.proximoMedSub
                            : isMedico
                              ? "Cadastre prescrições no módulo de Medicamentos."
                              : "Aguardando novas prescrições médicas."}
                        </p>
                      </div>

                      <div className="space-y-2.5 rounded-xl border border-gray-200 bg-[#FAFCFE] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Ficha Cadastral & Endereço
                        </p>

                        <div className="space-y-1.5 text-xs text-gray-600">
                          {idosoAtivo.data_nascimento && (
                            <p className="flex items-center gap-2">
                              <Calendar
                                size={14}
                                className="shrink-0 text-[#1565C0]"
                              />
                              <span>
                                Nascimento:{" "}
                                <strong className="font-semibold text-[#0A2540]">
                                  {formatarDataBr(idosoAtivo.data_nascimento)}
                                </strong>
                                {idosoAtivo.sexo
                                  ? ` (${formatarSexo(idosoAtivo.sexo)})`
                                  : ""}
                              </span>
                            </p>
                          )}

                          {idosoAtivo.cpf && (
                            <p className="flex items-center gap-2">
                              <FileText
                                size={14}
                                className="shrink-0 text-[#1565C0]"
                              />
                              <span>
                                CPF:{" "}
                                <strong className="font-semibold text-[#0A2540]">
                                  {formatarCpf(idosoAtivo.cpf)}
                                </strong>
                              </span>
                            </p>
                          )}

                          <p className="flex items-center gap-2">
                            <Phone
                              size={14}
                              className="shrink-0 text-[#26A69A]"
                            />
                            <span>
                              Telefone:{" "}
                              <strong className="font-semibold text-[#0A2540]">
                                {idosoAtivo.telefone || "Não informado"}
                              </strong>
                            </span>
                          </p>

                          <p className="flex items-start gap-2">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0 text-[#1565C0]"
                            />
                            <span className="wrap-break-word">
                              Endereço:{" "}
                              <strong className="font-semibold text-[#0A2540]">
                                {idosoAtivo.endereco || "Não informado"}
                              </strong>
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
                <Users size={40} className="mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-[#0A2540]">
                  Nenhum paciente selecionado
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Selecione um paciente vinculado acima para visualizar os dados
                  clínicos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}