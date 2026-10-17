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
} from "lucide-react";

interface VinculoRegistro {
  id: string;
  usuario_id?: string;
  usuarioId?: string;
  idoso_id?: string;
  idosoId?: string;
  usuario?: {
    nome: string;
    perfil: string;
  };
  idoso?: {
    nome: string;
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
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const token = localStorage.getItem("saspi_token");
      const userRaw = localStorage.getItem("saspi_user");

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
        const resVinculos = await fetch(`${API_URL}/usuario-idoso`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });

        if (resVinculos.ok) {
          const vinculosData = await resVinculos.json();
          const arrVinculos = Array.isArray(vinculosData) ? vinculosData : (vinculosData.data || []);
          setVinculos(arrVinculos);
        } else {
          setVinculos([]);
        }
      } catch (err) {
        console.error("Erro ao carregar vínculos da API:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  async function handleDesvincular(idVinculo: string) {
    if (!confirm("Tem certeza que deseja remover este vínculo do sistema?")) return;

    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(`${API_URL}/usuario-idoso/${idVinculo}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error("Falha no servidor ao excluir vínculo.");
      }

      setVinculos((prev) => prev.filter((v) => v.id !== idVinculo));
      setMensagemSucesso("Vínculo removido permanentemente!");
      setTimeout(() => setMensagemSucesso(""), 4000);
    } catch (error) {
      alert("Erro ao tentar desvincular paciente. O servidor não respondeu corretamente.");
    }
  }

  if (carregando || autorizado === null) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500">
          <Loader2 size={24} className="mx-auto animate-spin text-[#1565C0]" />
          <p className="mt-2 text-sm font-medium">Buscando histórico de vínculos...</p>
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
          <h1 className="mt-4 text-2xl font-bold text-[#0A2540]">Acesso Restrito</h1>
          <p className="mt-2 text-sm text-gray-600">
            Apenas o nível de gestão (Administrador) tem permissão para listar e modificar os vínculos institucionais.
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
              Relação ativa de profissionais de saúde e familiares associados aos pacientes da clínica.
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

        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {vinculos.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Link2 size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 text-base font-semibold text-[#0A2540]">
                Nenhum vínculo registrado no banco de dados.
              </p>
              <p className="mt-1 text-sm">
                Utilize o botão acima para atribuir médicos e cuidadores aos idosos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
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
                    // Aproveita o "include" que acabamos de colocar no Backend NestJS
                    const nomeUsuario = v.usuario?.nome || "Usuário não identificado";
                    const perfilUsuario = v.usuario?.perfil || "Perfil Indisponível";
                    const nomeIdoso = v.idoso?.nome || "Paciente não identificado";

                    const tipoRaw = v.tipo_vinculo || v.tipoVinculo;
                    const tipoFormatado = formatarTipoVinculo(tipoRaw);

                    return (
                      <tr key={v.id} className="transition hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                              <User size={18} />
                            </div>
                            <div className="min-w-0 max-w-[200px]">
                              <p className="truncate font-semibold text-[#0A2540]" title={nomeUsuario}>
                                {nomeUsuario}
                              </p>
                              <p className="text-xs text-gray-500 truncate" title={perfilUsuario}>
                                {perfilUsuario}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-gray-800">
                            <HeartHandshake size={16} className="shrink-0 text-[#26A69A]" />
                            <span className="truncate max-w-[200px]" title={nomeIdoso}>{nomeIdoso}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1565C0]">
                            {tipoFormatado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDesvincular(v.id)}
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
      </div>
    </main>
  );
}