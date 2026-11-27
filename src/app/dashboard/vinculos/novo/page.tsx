"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  isAdminPerfil,
  normalizarPerfil,
  validarEObterClinicaId,
} from "@/lib/clinica";
import {
  ArrowLeft,
  UserCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

interface UsuarioOption {
  id: string;
  nome: string;
  email: string;
  perfil: string;
}

interface IdosoOption {
  id: string;
  nome: string;
  cpf?: string | null;
}

interface VinculoExistente {
  id?: string;
  usuario_id?: string;
  idoso_id?: string;
  usuario?: { id?: string };
  idoso?: { id?: string };
}

function obterTipoVinculoAutomatico(perfil?: string): {
  valor: string;
  descricao: string;
} {
  const p = normalizarPerfil(perfil);
  if (p === "MEDICO") {
    return {
      valor: "MEDICO_RESPONSAVEL",
      descricao: "Médico Responsável (Acompanhamento Clínico)",
    };
  }
  if (p === "ENFERMEIRO") {
    return {
      valor: "ENFERMEIRO",
      descricao: "Enfermeiro(a) Responsável (Cuidados de Enfermagem)",
    };
  }
  if (p === "CUIDADOR") {
    return {
      valor: "CUIDADOR",
      descricao: "Cuidador (Assistência diária e medicação)",
    };
  }
  return {
    valor: "FAMILIAR",
    descricao: "Familiar (Acompanhamento e notificações)",
  };
}

export default function NovoVinculoPage() {
  const router = useRouter();

  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [idosos, setIdosos] = useState<IdosoOption[]>([]);
  const [vinculosExistentes, setVinculosExistentes] = useState<VinculoExistente[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const [usuarioId, setUsuarioId] = useState<string>("");
  const [idosoId, setIdosoId] = useState<string>("");

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarListas = useCallback(async () => {
    const sessao = getUsuarioSessao();
    if (!sessao || !isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      setCarregandoDados(false);
      return;
    }

    setAutorizado(true);
    setCarregandoDados(true);
    setErro(null);

    try {
      const clinicaId = validarEObterClinicaId(sessao);
      const headers = getAuthHeaders(false);

      const [resUsuarios, resIdosos, resVinculos] = await Promise.all([
        fetch(`${API_URL}/usuario?clinica_id=${clinicaId}`, { headers }),
        fetch(`${API_URL}/idoso?clinica_id=${clinicaId}`, { headers }),
        fetch(`${API_URL}/usuario-idoso?clinica_id=${clinicaId}`, { headers }).catch(
          () => null
        ),
      ]);

      const dataUsuarios = await resUsuarios.json().catch(() => []);
      const dataIdosos = await resIdosos.json().catch(() => []);
      const dataVinculos = resVinculos?.ok
        ? await resVinculos.json().catch(() => [])
        : [];

      if (!resUsuarios.ok || !resIdosos.ok) {
        setErro("Não foi possível carregar a lista de usuários e pacientes.");
        return;
      }

      const listaUsuariosRaw: UsuarioOption[] = Array.isArray(dataUsuarios)
        ? dataUsuarios
        : dataUsuarios?.data || [];

      const elegiveis = listaUsuariosRaw.filter((u) => {
        const p = normalizarPerfil(u.perfil);
        return p !== "ADMINISTRADOR" && p !== "ADMIN" && p !== "IDOSO";
      });

      const listaIdosos: IdosoOption[] = Array.isArray(dataIdosos)
        ? dataIdosos
        : dataIdosos?.data || [];

      const listaVinculos: VinculoExistente[] = Array.isArray(dataVinculos)
        ? dataVinculos
        : dataVinculos?.data || [];

      setUsuarios(elegiveis);
      setIdosos(listaIdosos);
      setVinculosExistentes(listaVinculos);

      if (elegiveis.length > 0) {
        setUsuarioId(elegiveis[0].id);
      }
    } catch (err: any) {
      setErro(err?.message || "Erro de conexão ao carregar dados para vínculo.");
    } finally {
      setCarregandoDados(false);
    }
  }, []);

  useEffect(() => {
    carregarListas();
  }, [carregarListas]);

  const usuarioSelecionado = useMemo(
    () => usuarios.find((u) => u.id === usuarioId) || null,
    [usuarios, usuarioId]
  );

  const tipoVinculoAuto = useMemo(
    () => obterTipoVinculoAutomatico(usuarioSelecionado?.perfil),
    [usuarioSelecionado]
  );

  // Filtra apenas idosos que ainda NÃO estão vinculados ao usuário selecionado
  const idososDisponiveis = useMemo(() => {
    if (!usuarioId) return idosos;

    const idsJaVinculados = new Set(
      vinculosExistentes
        .filter(
          (v) => String(v.usuario_id || v.usuario?.id || "") === String(usuarioId)
        )
        .map((v) => String(v.idoso_id || v.idoso?.id || ""))
        .filter(Boolean)
    );

    return idosos.filter((idoso) => !idsJaVinculados.has(String(idoso.id)));
  }, [idosos, vinculosExistentes, usuarioId]);

  // Mantém o idoso selecionado sincronizado com a lista filtrada
  useEffect(() => {
    if (idososDisponiveis.length === 0) {
      setIdosoId("");
      return;
    }
    const aindaDisponivel = idososDisponiveis.some((i) => i.id === idosoId);
    if (!aindaDisponivel) {
      setIdosoId(idososDisponiveis[0].id);
    }
  }, [idososDisponiveis, idosoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!usuarioId || !idosoId) {
      setErro("Selecione um usuário e um paciente disponível para vincular.");
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
          tipo_vinculo: tipoVinculoAuto.valor,
        }),
      });

      const data = await res.json().catch(() => ({}));

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
      setErro("Erro de conexão com o servidor ao salvar o vínculo.");
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
            Apenas Administradores podem criar vínculos entre usuários e
            pacientes.
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
            Rede de Apoio & Assistência
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Vínculo Assistencial
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Associe um médico, enfermeiro, cuidador ou familiar ao paciente
            para liberar o acompanhamento autorizado.
          </p>
        </div>

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Vínculo registrado com sucesso! Redirecionando...
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
                  Selecione o integrante da equipe ou rede familiar e o idoso
                  acompanhado.
                </p>
              </div>
            </div>

            {carregandoDados ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
                <Loader2 size={18} className="animate-spin text-[#1565C0]" />
                Carregando usuários e pacientes...
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="usuario"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Profissional da Saúde / Cuidador / Familiar *
                  </label>
                  <select
                    id="usuario"
                    value={usuarioId}
                    onChange={(e) => {
                      setErro(null);
                      setUsuarioId(e.target.value);
                    }}
                    disabled={usuarios.length === 0}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 disabled:bg-gray-100"
                  >
                    {usuarios.length === 0 ? (
                      <option value="">
                        Nenhum usuário elegível cadastrado na clínica
                      </option>
                    ) : (
                      usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} ({u.perfil}) — {u.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="idoso"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Paciente (Idoso) *
                  </label>
                  <select
                    id="idoso"
                    value={idosoId}
                    onChange={(e) => {
                      setErro(null);
                      setIdosoId(e.target.value);
                    }}
                    disabled={idososDisponiveis.length === 0}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 disabled:bg-gray-100"
                  >
                    {idosos.length === 0 ? (
                      <option value="">Nenhum paciente cadastrado</option>
                    ) : idososDisponiveis.length === 0 ? (
                      <option value="">
                        Todos os pacientes já estão vinculados a este usuário
                      </option>
                    ) : (
                      idososDisponiveis.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nome}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Papel / Tipo de Vínculo (Automático)
                  </label>
                  <div className="flex min-h-11.5 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                    {usuarioSelecionado
                      ? tipoVinculoAuto.descricao
                      : "Selecione um usuário"}
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/vinculos"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={
                salvando ||
                carregandoDados ||
                usuarios.length === 0 ||
                idososDisponiveis.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Salvando..." : "Confirmar Vínculo"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}