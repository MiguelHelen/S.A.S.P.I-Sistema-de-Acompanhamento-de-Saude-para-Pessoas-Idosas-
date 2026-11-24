"use client";

import { useEffect, useState, useCallback } from "react";
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
  Link2,
  Plus,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  HeartHandshake,
} from "lucide-react";

interface VinculoItem {
  id: string;
  papel?: string;
  parentesco?: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    perfil?: string;
    clinica_id?: string;
  };
  idoso?: {
    id: string;
    nome: string;
    clinica_id?: string;
  };
}

export default function VinculosPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [vinculos, setVinculos] = useState<VinculoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const carregarVinculos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const sessao = getUsuarioSessao();
    if (!sessao || !isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      setCarregando(false);
      return;
    }

    setAutorizado(true);

    try {
      const clinicaId = validarEObterClinicaId(sessao);
      const headers = getAuthHeaders(false);

      const [resVinculos, resIdosos] = await Promise.all([
        fetch(`${API_URL}/usuario-idoso`, { headers }),
        fetch(`${API_URL}/idoso?clinica_id=${clinicaId}`, { headers }).catch(
          () => null
        ),
      ]);

      if (!resVinculos.ok) {
        throw new Error("Não foi possível carregar os vínculos de cuidado.");
      }

      const rawVinculos = await resVinculos.json();
      const listaVinculos = Array.isArray(rawVinculos)
        ? rawVinculos
        : rawVinculos?.data || [];

      const idsIdososClinica = new Set<string>();
      if (resIdosos?.ok) {
        const rawIdosos = await resIdosos.json();
        const listaIdosos = Array.isArray(rawIdosos)
          ? rawIdosos
          : rawIdosos?.data || [];
        listaIdosos
          .filter((i: any) => !i.clinica_id || i.clinica_id === clinicaId)
          .forEach((i: any) => idsIdososClinica.add(String(i.id)));
      }

      const filtrados: VinculoItem[] = listaVinculos.filter((v: any) => {
        const idosoId = String(v.idoso?.id || v.idoso_id || "");
        const clinicaDoIdoso = v.idoso?.clinica_id;
        const clinicaDoUsuario = v.usuario?.clinica_id;

        if (clinicaDoIdoso && clinicaDoIdoso !== clinicaId) return false;
        if (clinicaDoUsuario && clinicaDoUsuario !== clinicaId) return false;
        if (idsIdososClinica.size > 0 && idosoId) {
          return idsIdososClinica.has(idosoId);
        }
        return true;
      });

      setVinculos(filtrados);
    } catch (err: any) {
      setErro(err.message || "Falha ao carregar vínculos.");
      setVinculos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarVinculos();
  }, [carregarVinculos]);

  async function handleRemoverVinculo(v: VinculoItem) {
    const confirmou = window.confirm(
      `Desvincular "${v.usuario?.nome || "Usuário"}" de "${v.idoso?.nome || "Paciente"}"?`
    );
    if (!confirmou) return;

    setRemovendoId(v.id);
    setErro("");
    setMensagem("");

    try {
      const res = await fetch(`${API_URL}/usuario-idoso/${v.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Não foi possível remover o vínculo."
        );
      }

      setVinculos((prev) => prev.filter((item) => item.id !== v.id));
      setMensagem("Vínculo removido com sucesso!");
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Erro ao desvincular.");
    } finally {
      setRemovendoId(null);
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
            Apenas Administradores podem gerenciar vínculos entre equipe,
            familiares e pacientes.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Rede de Cuidados
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Vínculos de Acompanhamento
            </h1>
            <p className="mt-2 text-gray-600">
              Associe médicos, cuidadores e familiares aos pacientes da clínica.
            </p>
          </div>

          <Link
            href="/dashboard/vinculos/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
          >
            <Plus size={18} />
            Novo Vínculo
          </Link>
        </div>

        {mensagem && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{mensagem}</p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Link2 size={20} className="text-[#1565C0]" />
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Vínculos Ativos ({vinculos.length})
              </h2>
            </div>
          </div>

          <div className="mt-6">
            {carregando ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                <Loader2 size={24} className="animate-spin text-[#1565C0]" />
                <span className="ml-2">Carregando vínculos...</span>
              </div>
            ) : vinculos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
                <HeartHandshake size={36} className="mx-auto text-gray-300" />
                <p className="mt-3 font-semibold text-[#0A2540]">
                  Nenhum vínculo cadastrado
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Crie vínculos para liberar o acompanhamento clínico ou familiar
                  de cada paciente.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {vinculos.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#0A2540]">
                          <UserCheck size={16} className="text-[#1565C0]" />
                          {v.usuario?.nome || "Usuário"}
                        </span>
                        <span className="rounded-full bg-[#E8F1FB] px-2.5 py-0.5 text-[11px] font-semibold text-[#1565C0]">
                          {v.papel || v.usuario?.perfil || "VÍNCULO"}
                        </span>
                        {v.parentesco && (
                          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700">
                            {v.parentesco}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Paciente acompanhado:{" "}
                        <strong className="text-gray-700">
                          {v.idoso?.nome || "Paciente"}
                        </strong>
                        {v.usuario?.email ? ` • ${v.usuario.email}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={removendoId === v.id}
                      onClick={() => handleRemoverVinculo(v)}
                      className="inline-flex items-center gap-1.5 self-start rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:self-center"
                    >
                      {removendoId === v.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Desvincular
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}