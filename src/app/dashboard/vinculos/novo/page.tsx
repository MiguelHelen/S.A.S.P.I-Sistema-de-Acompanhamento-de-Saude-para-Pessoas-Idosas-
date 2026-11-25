"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  isAdminPerfil,
  validarEObterClinicaId,
} from "@/lib/clinica";
import {
  ArrowLeft,
  UserCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface UsuarioOption {
  id: string;
  nome: string;
  email?: string;
  perfil: string;
}

interface IdosoOption {
  id: string;
  nome: string;
}

function mapearTipoVinculoPorPerfil(perfil?: string): string {
  const p = String(perfil || "").toUpperCase();
  if (p === "MEDICO") return "MEDICO_RESPONSAVEL";
  if (p === "ENFERMEIRO") return "ENFERMEIRO";
  if (p === "FAMILIAR") return "FAMILIAR";
  return "CUIDADOR";
}

export default function NovoVinculoPage() {
  const router = useRouter();

  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [idosos, setIdosos] = useState<IdosoOption[]>([]);
  const [carregandoListas, setCarregandoListas] = useState(true);

  const [usuarioId, setUsuarioId] = useState("");
  const [idosoId, setIdosoId] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState("MEDICO_RESPONSAVEL");

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarOpcoes = useCallback(async () => {
    const sessao = getUsuarioSessao();
    if (!sessao || !isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      setCarregandoListas(false);
      return;
    }

    setAutorizado(true);
    setCarregandoListas(true);
    setErro(null);

    try {
      const clinicaId = validarEObterClinicaId(sessao);
      const headers = getAuthHeaders(false);

      const [resUsuarios, resIdosos] = await Promise.all([
        fetch(`${API_URL}/usuario?clinica_id=${clinicaId}`, { headers }),
        fetch(`${API_URL}/idoso?clinica_id=${clinicaId}`, { headers }),
      ]);

      const dataUsuarios = await resUsuarios.json();
      const dataIdosos = await resIdosos.json();

      if (!resUsuarios.ok || !resIdosos.ok) {
        const msg =
          dataUsuarios?.message ||
          dataIdosos?.message ||
          "Não foi possível carregar usuários e pacientes da clínica.";
        setErro(Array.isArray(msg) ? msg.join(", ") : msg);
        return;
      }

      const listaUsuarios: UsuarioOption[] = (
        Array.isArray(dataUsuarios) ? dataUsuarios : []
      ).filter(
        (u: UsuarioOption) =>
          String(u.perfil).toUpperCase() !== "ADMINISTRADOR"
      );

      const listaIdosos: IdosoOption[] = Array.isArray(dataIdosos)
        ? dataIdosos
        : [];

      setUsuarios(listaUsuarios);
      setIdosos(listaIdosos);

      if (listaUsuarios.length > 0) {
        setUsuarioId(listaUsuarios[0].id);
        setTipoVinculo(mapearTipoVinculoPorPerfil(listaUsuarios[0].perfil));
      }

      if (listaIdosos.length > 0) {
        setIdosoId(listaIdosos[0].id);
      }
    } catch (err: any) {
      setErro(
        err?.message || "Erro de conexão ao carregar dados para vinculação."
      );
    } finally {
      setCarregandoListas(false);
    }
  }, []);

  useEffect(() => {
    carregarOpcoes();
  }, [carregarOpcoes]);

  function handleUsuarioChange(novoUsuarioId: string) {
    setUsuarioId(novoUsuarioId);
    const selecionado = usuarios.find((u) => u.id === novoUsuarioId);
    if (selecionado) {
      setTipoVinculo(mapearTipoVinculoPorPerfil(selecionado.perfil));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!usuarioId || !idosoId || !tipoVinculo) {
      setErro("Selecione o usuário, o paciente e o tipo de vínculo.");
      return;
    }

    setSalvando(true);

    try {
      const res = await fetch(`${API_URL}/usuario-idoso`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          usuario_id: usuarioId,
          idoso_id: idosoId,
          tipo_vinculo: tipoVinculo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível criar o vínculo.";
        setErro(msg);
        return;
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/vinculos");
      }, 900);
    } catch {
      setErro("Erro de conexão ao registrar o vínculo.");
    } finally {
      setSalvando(false);
    }
  }

  if (autorizado === false) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldAlert size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#0A2540]">
            Acesso Restrito
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Apenas Administradores podem criar novos vínculos assistenciais.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/vinculos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para vínculos
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Governança & LGPD
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Vínculo Assistencial
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Associe um profissional de saúde, cuidador ou familiar ao paciente
            para liberar o acompanhamento autorizado.
          </p>
        </div>

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Vínculo criado com sucesso! Redirecionando...
            </p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <UserCheck size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Dados da Associação
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Defina quem acompanhará o idoso e qual será o papel exercido.
                </p>
              </div>
            </div>

            {carregandoListas ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={18} className="animate-spin text-[#1565C0]" />
                Carregando equipe e pacientes...
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="usuario_id"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Profissional, Cuidador ou Familiar *
                  </label>
                  <select
                    id="usuario_id"
                    value={usuarioId}
                    onChange={(e) => handleUsuarioChange(e.target.value)}
                    disabled={usuarios.length === 0}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    {usuarios.length === 0 ? (
                      <option value="">Nenhum usuário elegível cadastrado</option>
                    ) : (
                      usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} ({u.perfil})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="idoso_id"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Paciente (Idoso) *
                  </label>
                  <select
                    id="idoso_id"
                    value={idosoId}
                    onChange={(e) => setIdosoId(e.target.value)}
                    disabled={idosos.length === 0}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    {idosos.length === 0 ? (
                      <option value="">Nenhum paciente cadastrado</option>
                    ) : (
                      idosos.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nome}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="tipo_vinculo"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Tipo de Vínculo *
                  </label>
                  <select
                    id="tipo_vinculo"
                    value={tipoVinculo}
                    onChange={(e) => setTipoVinculo(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="MEDICO_RESPONSAVEL">Médico Responsável</option>
                    <option value="ENFERMEIRO">Enfermeiro(a)</option>
                    <option value="CUIDADOR">Cuidador(a)</option>
                    <option value="FAMILIAR">Familiar</option>
                  </select>
                </div>
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-[#DCEAF8] bg-[#F8FBFE] p-5">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-[#1565C0]"
              />
              <p className="text-sm leading-relaxed text-gray-600">
                Em conformidade com a LGPD e as regras de controle de acesso do
                S.A.S.P.I., apenas usuários explicitamente vinculados ao idoso
                podem consultar ou registrar dados no prontuário e conectar-se à
                sala de telemetria em tempo real.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/vinculos"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={salvando || carregandoListas || !usuarioId || !idosoId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Vinculando..." : "Salvar Vínculo"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}