"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import type { Idoso } from "@/components/PatientSelector";
import {
  ArrowLeft,
  HeartPulse,
  Save,
  Loader2,
  CheckCircle2,
  ClipboardList,
  UserCheck,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function NovoRegistro() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [idoso, setIdoso] = useState<Idoso | null>(null);

  const [formData, setFormData] = useState({
    indicador_nome: "Frequência Cardíaca",
    valor: "",
    unidade: "bpm",
    observacao: "",
  });

  useEffect(() => {
    const activeElderly = localStorage.getItem("saspi_active_elderly");
    if (activeElderly) {
      try {
        setIdoso(JSON.parse(activeElderly));
      } catch {}
    }
  }, []);

  function handleIndicadorChange(nome_indicador: string) {
    let novaUnidade = "bpm";
    if (nome_indicador === "Oxigenação") novaUnidade = "%";
    if (nome_indicador === "Pressão Arterial") novaUnidade = "mmHg";

    setFormData({
      ...formData,
      indicador_nome: nome_indicador,
      unidade: novaUnidade,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    if (!idoso || !idoso.id) {
      setErro("Nenhum idoso ativo selecionado. Selecione um paciente no topo do dashboard.");
      setSalvando(false);
      return;
    }

    const token = localStorage.getItem("saspi_token");

    // Payload estruturado conforme o contrato do backend NestJS para a entidade registro-saude
    const payload = {
      idoso_id: idoso.id,
      indicador_nome: formData.indicador_nome,
      valor: formData.valor.trim(),
      unidade: formData.unidade,
      observacao: formData.observacao.trim() || undefined,
      origem: "Manual",
    };

    try {
      const res = await fetch(`${API_URL}/registro-saude`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || `Erro ${res.status}: Não foi possível registrar o sinal vital.`
        );
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/historico");
      }, 1500);
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao salvar o registro de saúde.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/historico"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para o histórico
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Registro de saúde
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo registro de saúde
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Adicione manualmente uma nova aferição para manter a linha de evolução e os gráficos atualizados.
          </p>
        </div>

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Sinal vital gravado com sucesso no banco de dados! Redirecionando...
            </p>
          </div>
        )}

        {idoso && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-[#E8F1FB] p-4 text-[#0A2540]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1565C0] shadow-sm">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
                Aferição vinculada ao paciente:
              </span>
              <p className="text-sm font-bold">
                {idoso.nome} ({idoso.idade} anos)
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <HeartPulse size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações do indicador
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Informe qual sinal vital foi aferido na rotina de cuidados.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="indicador"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Indicador de saúde *
                </label>
                <select
                  id="indicador"
                  value={formData.indicador_nome}
                  onChange={(e) => handleIndicadorChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="Frequência Cardíaca">
                    Frequência cardíaca
                  </option>
                  <option value="Oxigenação">Oxigenação (SpO₂)</option>
                  <option value="Pressão Arterial">Pressão arterial</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="valor"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Valor aferido *
                </label>
                <input
                  id="valor"
                  type="text"
                  required
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  placeholder={
                    formData.indicador_nome === "Pressão Arterial"
                      ? "Ex.: 120/80"
                      : "Ex.: 72"
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="unidade"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Unidade de medida
                </label>
                <input
                  id="unidade"
                  type="text"
                  readOnly
                  value={formData.unidade}
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="observacao"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Observações clínicas
                </label>
                <textarea
                  id="observacao"
                  rows={4}
                  value={formData.observacao}
                  onChange={(e) =>
                    setFormData({ ...formData, observacao: e.target.value })
                  }
                  placeholder="Ex.: Aferido em repouso após 15 minutos..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-[#DCEAF8] bg-[#F8FBFE] p-5">
            <div className="flex gap-3">
              <ClipboardList
                size={20}
                className="mt-0.5 shrink-0 text-[#1565C0]"
              />
              <p className="text-sm leading-relaxed text-gray-600">
                Este registro será gravado permanentemente na base de dados, unificando-se aos dados automáticos coletados via smartbands para alimentar o histórico integrado do S.A.S.P.I.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/historico"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={salvando || !idoso}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Gravando no banco..." : "Salvar registro"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}