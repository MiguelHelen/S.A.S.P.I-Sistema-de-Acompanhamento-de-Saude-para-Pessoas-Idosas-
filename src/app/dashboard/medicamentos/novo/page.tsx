"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import type { Idoso } from "@/components/PatientSelector";
import { getUsuarioSessao } from "@/lib/clinica";
import {
  ArrowLeft,
  Pill,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

interface MedicamentoOption {
  id: string;
  nome: string;
  descricao?: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

function hojeIsoDate(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function NovoMedicamentoPage() {
  const router = useRouter();

  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [idoso, setIdoso] = useState<Idoso | null>(null);
  const [medicamentos, setMedicamentos] = useState<MedicamentoOption[]>([]);
  const [carregandoMedicamentos, setCarregandoMedicamentos] = useState(true);

  const [medicamentoId, setMedicamentoId] = useState<string>("");
  const [dosagem, setDosagem] = useState<string>("");
  const [frequencia, setFrequencia] = useState<string>("A cada 8 horas (8h)");
  const [dataInicio, setDataInicio] = useState<string>(hojeIsoDate());
  const [dataFim, setDataFim] = useState<string>("");

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const sessao = getUsuarioSessao();
    if (!sessao || sessao.perfil !== "MEDICO") {
      setAutorizado(false);
      return;
    }

    setAutorizado(true);

    const activeElderly = localStorage.getItem("saspi_active_elderly");
    if (activeElderly) {
      try {
        const parsed = JSON.parse(activeElderly);
        if (parsed && parsed.id) {
          setIdoso(parsed);
        }
      } catch {
        // Ignora JSON inválido no localStorage
      }
    }
  }, []);

  const carregarMedicamentos = useCallback(async () => {
    const token = localStorage.getItem("saspi_token");
    setCarregandoMedicamentos(true);

    try {
      const res = await fetch(`${API_URL}/medicamento`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível carregar o catálogo de medicamentos.";
        setErro(msg);
        setMedicamentos([]);
        return;
      }

      const lista: MedicamentoOption[] = Array.isArray(data) ? data : [];
      setMedicamentos(lista);
      if (lista.length > 0) {
        setMedicamentoId(lista[0].id);
      }
    } catch {
      setErro("Erro de conexão ao buscar os medicamentos cadastrados.");
      setMedicamentos([]);
    } finally {
      setCarregandoMedicamentos(false);
    }
  }, []);

  useEffect(() => {
    if (autorizado === true) {
      carregarMedicamentos();
    }
  }, [autorizado, carregarMedicamentos]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!idoso?.id) {
      setErro(
        "Nenhum paciente selecionado. Volte ao painel e selecione um paciente ativo antes de prescrever."
      );
      return;
    }

    if (!medicamentoId) {
      setErro("Selecione um medicamento válido.");
      return;
    }

    if (!dosagem.trim()) {
      setErro("Informe a dosagem da prescrição.");
      return;
    }

    if (!frequencia.trim()) {
      setErro("Informe a frequência de administração.");
      return;
    }

    if (!dataInicio) {
      setErro("Informe a data de início do tratamento.");
      return;
    }

    const token = localStorage.getItem("saspi_token");
    if (!token) {
      setErro("Sessão expirada ou não autenticada. Faça login novamente.");
      return;
    }

    const payload: {
      idoso_id: string;
      medicamento_id: string;
      dosagem: string;
      frequencia: string;
      data_inicio: string;
      data_fim?: string;
      status: "ATIVA";
    } = {
      idoso_id: idoso.id,
      medicamento_id: medicamentoId,
      dosagem: dosagem.trim(),
      frequencia: frequencia.trim(),
      data_inicio: new Date(`${dataInicio}T00:00:00`).toISOString(),
      status: "ATIVA",
    };

    if (dataFim) {
      payload.data_fim = new Date(`${dataFim}T23:59:59`).toISOString();
    }

    setSalvando(true);

    try {
      const res = await fetch(`${API_URL}/prescricao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const mensagemServidor = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível salvar a prescrição.";
        setErro(mensagemServidor);
        return;
      }

      setSucesso(true);
      setDosagem("");
      setDataFim("");

      setTimeout(() => {
        router.push("/dashboard/medicamentos");
      }, 900);
    } catch {
      setErro("Erro de conexão com o servidor ao salvar a prescrição.");
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
            Apenas Médicos vinculados possuem permissão clínica para emitir
            prescrições de medicamentos.
          </p>
          <Link
            href="/dashboard/medicamentos"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A2540]"
          >
            <ArrowLeft size={16} />
            Voltar para Medicamentos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/medicamentos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para medicamentos
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Rotina de cuidados
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Nova Prescrição
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Cadastre uma prescrição médica para organizar a posologia e o
            acompanhamento de doses do paciente.
          </p>
        </div>

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Prescrição registrada com sucesso! Redirecionando...
            </p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        {idoso ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-[#E8F1FB] p-4 text-[#0A2540]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1565C0] shadow-sm">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
                Prescrição vinculada ao paciente:
              </span>
              <p className="text-sm font-bold">
                {idoso.nome} ({idoso.idade} anos)
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <AlertCircle size={20} className="shrink-0 text-amber-600" />
            <p className="text-sm font-medium">
              Nenhum paciente ativo encontrado. Selecione um paciente no painel
              antes de salvar.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Pill size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Dados da prescrição
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Escolha o medicamento, informe a dosagem, a frequência e o
                  período do tratamento.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="medicamento"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Medicamento *
                </label>
                {carregandoMedicamentos ? (
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin text-[#1565C0]" />
                    Carregando medicamentos...
                  </div>
                ) : (
                  <select
                    id="medicamento"
                    value={medicamentoId}
                    disabled={medicamentos.length === 0}
                    onChange={(e) => setMedicamentoId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 disabled:bg-gray-100"
                  >
                    {medicamentos.length === 0 ? (
                      <option value="">Nenhum medicamento disponível</option>
                    ) : (
                      medicamentos.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.nome}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              <div>
                <label
                  htmlFor="dosagem"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Dosagem *
                </label>
                <input
                  id="dosagem"
                  type="text"
                  required
                  value={dosagem}
                  onChange={(e) => setDosagem(e.target.value)}
                  placeholder="Ex.: 50mg / 1 comprimido"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="frequencia"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Frequência *
                </label>
                <select
                  id="frequencia"
                  value={frequencia}
                  onChange={(e) => setFrequencia(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="Uma vez ao dia (24h)">Uma vez ao dia (24h)</option>
                  <option value="A cada 12 horas (12h)">A cada 12 horas (12h)</option>
                  <option value="A cada 8 horas (8h)">A cada 8 horas (8h)</option>
                  <option value="A cada 6 horas (6h)">A cada 6 horas (6h)</option>
                  <option value="Conforme necessidade">Conforme necessidade</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="data_inicio"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Data de início *
                </label>
                <input
                  id="data_inicio"
                  type="date"
                  required
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="data_fim"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Data de término (opcional)
                </label>
                <input
                  id="data_fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
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
                A prescrição será vinculada ao paciente selecionado e ao
                profissional autenticado, ficando disponível para confirmação de
                doses e auditoria no histórico de adesão.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/medicamentos"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={salvando || carregandoMedicamentos || !idoso?.id}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Salvando..." : "Salvar prescrição"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}