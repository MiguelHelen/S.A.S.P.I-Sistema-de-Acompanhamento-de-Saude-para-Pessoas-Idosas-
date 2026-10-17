"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  Link2,
  Plus,
  Loader2,
  ShieldAlert,
  HeartHandshake,
  User,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
} from "lucide-react";

interface VinculoRegistro {
  id: string;
  usuario_id?: string;
  usuarioId?: string;
  idoso_id?: string;
  idosoId?: string;
  usuario?: {
    id?: string;
    nome?: string;
    perfil?: string;
  };
  idoso?: {
    id?: string;
    nome?: string;
  };
  tipo_vinculo?: string;
  tipoVinculo?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

function formatarTipoVinculo(tipo?: string): string {
  if (!tipo) return "Vínculo de Acompanhamento";
  const t = tipo.toUpperCase();
  switch (t) {
    case "MEDICO_RESPONSAVEL":
      return "Médico Responsável";
    case "ENFERMEIRO":
    case "ENFERMEIRO_RESPONSAVEL":
      return "Enfermeiro(a) Responsável";
    case "CUIDADOR":
      return "Cuidador";
    case "FAMILIAR":
      return "Familiar";
    default:
      return tipo;
  }
}

export default function ListaVinculosPage() {
  const [vinculos, setVinculos] = useState<VinculoRegistro[]>([]);
  const [usuariosMap, setUsuariosMap] = useState<
    Record<string, { nome: string; perfil: string }>
  >({});
  const [idososMap, setIdososMap] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const [vinculoParaDeletar, setVinculoParaDeletar] = useState<string | null>(
    null
  );
  const [apagando, setApagando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const token = localStorage.getItem("saspi_token");
      const userRaw = localStorage.getItem("saspi_user");
      let clinicaId = "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          const userData = parsed.user || parsed.usuario || parsed;
          const perfil = (userData.perfil || userData.role || "").toUpperCase();

          if (perfil !== "ADMINISTRADOR" && perfil !== "ADMIN") {
            setAutorizado(false);
            setCarregando(false);
            return;
          }
          setAutorizado(true);
          clinicaId = userData.clinica_id || userData.clinicaId || clinicaId;
        } catch {
          setAutorizado(false);
          setCarregando(false);
          return;
        }
      } else {
        setAutorizado(false);
        setCarregando(false);
        return;
      }

      try {
        const headersAuth = {
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const [resUsers, resIdosos, resVinculos] = await Promise.all([
          fetch(`${API_URL}/usuario?clinica_id=${clinicaId}`, {
            headers: headersAuth,
          }).catch(() => null),
          fetch(`${API_URL}/idoso?clinica_id=${clinicaId}`, {
            headers: headersAuth,
          }).catch(() => null),
          fetch(`${API_URL}/usuario-idoso`, {
            headers: headersAuth,
          }).catch(() => null),
        ]);

        if (resUsers?.ok) {
          const usersData = await resUsers.json();
          const uMap: Record<string, { nome: string; perfil: string }> = {};
          if (Array.isArray(usersData)) {
            usersData.forEach((u: any) => {
              if (u.id) uMap[u.id] = { nome: u.nome, perfil: u.perfil };
            });
          }
          setUsuariosMap(uMap);
        }

        let listaIdososDaClinica: any[] = [];
        if (resIdosos?.ok) {
          const idososData = await resIdosos.json();
          const iMap: Record<string, string> = {};
          if (Array.isArray(idososData)) {
            listaIdososDaClinica = idososData;
            idososData.forEach((i: any) => {
              if (i.id) iMap[i.id] = i.nome;
            });
          }
          setIdososMap(iMap);
        }

        if (resVinculos?.ok) {
          const vinculosData = await resVinculos.json();
          const arrVinculos = Array.isArray(vinculosData)
            ? vinculosData
            : vinculosData.data || [];
          setVinculos(arrVinculos);
        } else if (listaIdososDaClinica.length > 0) {
          // Fallback resiliente: busca os vínculos por idoso na rota legada GET /usuario-idoso/idoso/:idosoId
          const promessasPorIdoso = listaIdososDaClinica.map((idosoObj) =>
            fetch(`${API_URL}/usuario-idoso/idoso/${idosoObj.id}`, {
              headers: headersAuth,
            })
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => [])
          );
          const resultadosPorIdoso = await Promise.all(promessasPorIdoso);
          const agregados = resultadosPorIdoso.flat();
          setVinculos(Array.isArray(agregados) ? agregados : []);
        } else {
          setVinculos([]);
        }
      } catch {
        setVinculos([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  async function confirmarEExecutarDesvinculo() {
    if (!vinculoParaDeletar) return;

    setApagando(true);
    setErroAcao("");
    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(
        `${API_URL}/usuario-idoso/${vinculoParaDeletar}`,
        {
          method: "DELETE",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Falha no servidor ao excluir o vínculo."
        );
      }

      setVinculos((prev) => prev.filter((v) => v.id !== vinculoParaDeletar));
      setVinculoParaDeletar(null);
      setMensagemSucesso("Vínculo removido permanentemente!");
      setTimeout(() => setMensagemSucesso(""), 4000);
    } catch (err: any) {
      setVinculoParaDeletar(null);
      setErroAcao(
        err.message || "Erro ao tentar desvincular paciente na base de dados."
      );
    } finally {
      setApagando(false);
    }
  }

  if (carregando || autorizado === null) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500">
          <Loader2 size={24} className="mx-auto animate-spin text-[#1565C0]" />
          <p className="mt-2 text-sm font-medium">
            Buscando histórico de vínculos...
          </p>
        </div>
      </main>
    );
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
            Apenas o nível de gestão (Administrador) tem permissão para listar e
            modificar os vínculos institucionais.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <ArrowLeft size={16} />
              Voltar ao Dashboard
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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
            >
              <ArrowLeft size={17} />
              Voltar para o Dashboard
            </Link>

            <span className="mt-6 block text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Gestão Institucional
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Vínculos da Instituição
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Relação ativa de profissionais de saúde e familiares associados
              aos pacientes da clínica.
            </p>
          </div>

          <Link
            href="/dashboard/vinculos/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={19} />
            Novo Vínculo
          </Link>
        </div>

        {mensagemSucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{mensagemSucesso}</p>
          </div>
        )}

        {erroAcao && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erroAcao}</p>
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {vinculos.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Link2 size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 text-base font-semibold text-[#0A2540]">
                Nenhum vínculo registrado no banco de dados.
              </p>
              <p className="mt-1 text-sm">
                Utilize o botão acima para atribuir médicos e cuidadores aos
                idosos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">Profissional / Familiar</th>
                    <th className="px-6 py-4">Paciente Monitorado</th>
                    <th className="px-6 py-4">Status / Tipo de Vínculo</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {vinculos.map((v) => {
                    const uId = v.usuario?.id || v.usuario_id || v.usuarioId;
                    const iId = v.idoso?.id || v.idoso_id || v.idosoId;

                    const nomeUsuario =
                      v.usuario?.nome ||
                      (uId && usuariosMap[uId]?.nome) ||
                      "Usuário não identificado";
                    const perfilUsuario =
                      v.usuario?.perfil ||
                      (uId && usuariosMap[uId]?.perfil) ||
                      "Membro";
                    const nomeIdoso =
                      v.idoso?.nome ||
                      (iId && idososMap[iId]) ||
                      "Paciente não identificado";

                    const tipoRaw = v.tipo_vinculo || v.tipoVinculo;
                    const tipoFormatado = formatarTipoVinculo(tipoRaw);

                    return (
                      <tr key={v.id} className="transition hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                              <User size={18} />
                            </div>
                            <div className="max-w-[220px] min-w-0">
                              <p
                                className="truncate font-semibold text-[#0A2540]"
                                title={nomeUsuario}
                              >
                                {nomeUsuario}
                              </p>
                              <p
                                className="truncate text-xs text-gray-500"
                                title={perfilUsuario}
                              >
                                {perfilUsuario}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-gray-800">
                            <HeartHandshake
                              size={16}
                              className="shrink-0 text-[#26A69A]"
                            />
                            <span
                              className="max-w-[220px] truncate"
                              title={nomeIdoso}
                            >
                              {nomeIdoso}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1565C0]">
                            {tipoFormatado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setVinculoParaDeletar(v.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            Desvincular
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {vinculoParaDeletar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <AlertTriangle size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#0A2540]">
                    Remover Vínculo
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setVinculoParaDeletar(null)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={apagando}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-600">
                  Tem certeza que deseja desvincular este paciente do
                  profissional? O acesso ao acompanhamento e ao prontuário deste
                  idoso será revogado imediatamente.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setVinculoParaDeletar(null)}
                  disabled={apagando}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarEExecutarDesvinculo}
                  disabled={apagando}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-70"
                >
                  {apagando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {apagando ? "Removendo..." : "Sim, desvincular"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}