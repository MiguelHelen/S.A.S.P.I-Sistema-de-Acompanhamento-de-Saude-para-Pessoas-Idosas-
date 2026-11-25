"use client";

import { useState, useEffect, useCallback } from "react";
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
  UserCheck,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  ShieldAlert,
} from "lucide-react";

interface VinculoApi {
  id: string;
  usuario_id: string;
  idoso_id: string;
  tipo_vinculo: string;
  usuario?: {
    id?: string;
    nome?: string | null;
    email?: string | null;
    perfil?: string | null;
  } | null;
  idoso?: {
    id?: string;
    nome?: string | null;
    clinica_id?: string | null;
  } | null;
}

const LABELS_VINCULO: Record<string, string> = {
  MEDICO_RESPONSAVEL: "Médico Responsável",
  ENFERMEIRO: "Enfermeiro(a)",
  CUIDADOR: "Cuidador(a)",
  FAMILIAR: "Familiar",
};

export default function VinculosPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [vinculos, setVinculos] = useState<VinculoApi[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const carregarVinculos = useCallback(async () => {
    const sessao = getUsuarioSessao();
    if (!sessao || !isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      setCarregando(false);
      return;
    }

    setAutorizado(true);
    setCarregando(true);
    setErro(null);

    try {
      const clinicaId = validarEObterClinicaId(sessao);

      const res = await fetch(
        `${API_URL}/usuario-idoso?clinica_id=${clinicaId}`,
        {
          headers: getAuthHeaders(false),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível carregar os vínculos ativos.";
        setErro(msg);
        setVinculos([]);
        return;
      }

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setVinculos(lista);
    } catch (err: any) {
      setErro(
        err?.message || "Erro de conexão ao consultar os vínculos da instituição."
      );
      setVinculos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarVinculos();
  }, [carregarVinculos]);

  async function handleRemoverVinculo(vinculoId: string) {
    setErro(null);
    setAviso(null);
    setRemovendoId(vinculoId);

    try {
      const res = await fetch(`${API_URL}/usuario-idoso/${vinculoId}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível remover o vínculo.";
        setErro(msg);
        return;
      }

      setAviso("Vínculo revogado com sucesso.");
      await carregarVinculos();
    } catch {
      setErro("Erro de conexão ao tentar remover o vínculo.");
    } finally {
      setRemovendoId(null);
    }
  }

  const vinculosFiltrados = vinculos.filter((item) => {
    if (filtroTipo === "TODOS") return true;
    return String(item.tipo_vinculo).toUpperCase() === filtroTipo;
  });

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
            Apenas Administradores podem gerenciar os vínculos assistenciais da
            instituição.
          </p>
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
              Controle de Acesso & Rede de Apoio
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Vínculos da Instituição
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Gerencie quais profissionais de saúde, cuidadores e familiares
              possuem acesso autorizado ao prontuário de cada idoso.
            </p>
          </div>

          <Link
            href="/dashboard/vinculos/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={18} />
            Novo Vínculo
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["TODOS", "MEDICO_RESPONSAVEL", "ENFERMEIRO", "CUIDADOR", "FAMILIAR"].map(
            (tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setFiltroTipo(tipo)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filtroTipo === tipo
                    ? "bg-[#1565C0] text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tipo === "TODOS" ? "Todos os Vínculos" : LABELS_VINCULO[tipo] || tipo}
              </button>
            )
          )}
        </div>

        {aviso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{aviso}</span>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{erro}</span>
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-2">
            <Users size={19} className="text-[#1565C0]" />
            <h2 className="text-lg font-semibold text-[#0A2540]">
              Associações Autorizadas ({vinculosFiltrados.length})
            </h2>
          </div>

          {carregando ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
              <Loader2 size={18} className="animate-spin text-[#1565C0]" />
              Carregando vínculos...
            </div>
          ) : vinculosFiltrados.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="py-3 pr-4">Usuário / Profissional</th>
                    <th className="py-3 px-4">Paciente (Idoso)</th>
                    <th className="py-3 px-4">Tipo de Vínculo</th>
                    <th className="py-3 pl-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {vinculosFiltrados.map((item) => {
                    const nomeUsuario =
                      item.usuario?.nome || `Usuário (${item.usuario_id.slice(0, 8)})`;
                    const nomeIdoso =
                      item.idoso?.nome || `Paciente (${item.idoso_id.slice(0, 8)})`;
                    const tipoFormatado =
                      LABELS_VINCULO[item.tipo_vinculo] || item.tipo_vinculo;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 pr-4">
                          <div className="font-semibold text-[#0A2540]">
                            {nomeUsuario}
                          </div>
                          {item.usuario?.email && (
                            <div className="text-xs text-gray-500">
                              {item.usuario.email}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#0A2540]">
                          {nomeIdoso}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F1FB] px-3 py-1 text-xs font-semibold text-[#1565C0]">
                            <UserCheck size={13} />
                            {tipoFormatado}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            type="button"
                            disabled={removendoId === item.id}
                            onClick={() => handleRemoverVinculo(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Revogar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              Nenhum vínculo encontrado para o filtro selecionado.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}