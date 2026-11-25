"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { type Idoso, formatarCpf } from "@/components/PatientSelector";
import {
  ArrowLeft,
  HeartPulse,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  UserCheck,
} from "lucide-react";

interface IndicadorSaudeOption {
  id: string;
  nome: string;
  unidade?: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

function normalizarTexto(texto?: string | null): string {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function inferirUnidade(
  nomeIndicador: string,
  unidadeApi?: string | null
): string {
  if (unidadeApi && unidadeApi.trim() !== "") {
    return unidadeApi.trim();
  }
  const norm = normalizarTexto(nomeIndicador);
  if (norm.includes("pressao") || norm.includes("pa")) return "mmHg";
  if (
    norm.includes("saturacao") ||
    norm.includes("oxigenacao") ||
    norm.includes("spo2")
  ) {
    return "%";
  }
  if (norm.includes("temperatura") || norm.includes("termica")) return "°C";
  return "bpm";
}

export default function NovoRegistroHistoricoPage() {
  const router = useRouter();

  const [idoso, setIdoso] = useState<Idoso | null>(null);
  const [indicadores, setIndicadores] = useState<IndicadorSaudeOption[]>([]);
  const [carregandoIndicadores, setCarregandoIndicadores] = useState(true);

  const [indicadorId, setIndicadorId] = useState<string>("");
  const [valorInput, setValorInput] = useState<string>("");
  const [unidade, setUnidade] = useState<string>("bpm");

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
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

  const carregarIndicadores = useCallback(async () => {
    const token = localStorage.getItem("saspi_token");
    setCarregandoIndicadores(true);

    try {
      const res = await fetch(`${API_URL}/indicador-saude`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message ||
            "Não foi possível carregar os indicadores de saúde.";
        setErro(msg);
        setIndicadores([]);
        return;
      }

      const lista: IndicadorSaudeOption[] = Array.isArray(data) ? data : [];
      setIndicadores(lista);

      if (lista.length > 0) {
        const padrao =
          lista.find((ind) =>
            normalizarTexto(ind.nome).includes("frequencia")
          ) || lista[0];
        setIndicadorId(padrao.id);
        setUnidade(inferirUnidade(padrao.nome, padrao.unidade));
      }
    } catch {
      setErro("Erro de conexão ao buscar indicadores de saúde.");
      setIndicadores([]);
    } finally {
      setCarregandoIndicadores(false);
    }
  }, []);

  useEffect(() => {
    carregarIndicadores();
  }, [carregarIndicadores]);

  function handleIndicadorChange(novoId: string) {
    setIndicadorId(novoId);
    const selecionado = indicadores.find((item) => item.id === novoId);
    if (selecionado) {
      setUnidade(inferirUnidade(selecionado.nome, selecionado.unidade));
    }
  }

  const indicadorSelecionado = indicadores.find(
    (item) => item.id === indicadorId
  );
  const ehPressaoArterial = normalizarTexto(
    indicadorSelecionado?.nome
  ).includes("pressao");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!idoso?.id) {
      setErro(
        "Nenhum paciente selecionado. Volte ao painel e selecione um paciente ativo antes de registrar."
      );
      return;
    }

    if (!indicadorId) {
      setErro("Selecione um indicador de saúde válido.");
      return;
    }

    const valorLimpo = valorInput.trim().replace(",", ".");
    if (!valorLimpo) {
      setErro("Informe o valor aferido.");
      return;
    }

    const token = localStorage.getItem("saspi_token");
    if (!token) {
      setErro("Sessão expirada ou não autenticada. Faça login novamente.");
      return;
    }

    const numeroConvertido = Number(valorLimpo);
    const usarNumerico = !ehPressaoArterial && !Number.isNaN(numeroConvertido);

    const payload: {
      idoso_id: string;
      indicador_id: string;
      origem: "MANUAL";
      valor_numerico?: number;
      valor_categorico?: string;
    } = {
      idoso_id: idoso.id,
      indicador_id: indicadorId,
      origem: "MANUAL",
    };

    if (usarNumerico) {
      payload.valor_numerico = numeroConvertido;
    } else {
      payload.valor_categorico = valorInput.trim();
    }

    setSalvando(true);

    try {
      const res = await fetch(`${API_URL}/registro-saude`, {
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
          : data?.message || "Não foi possível salvar o registro de saúde.";
        setErro(mensagemServidor);
        return;
      }

      setSucesso(true);
      setValorInput("");

      setTimeout(() => {
        router.push("/dashboard/historico");
      }, 900);
    } catch {
      setErro("Erro de conexão com o servidor ao salvar a aferição.");
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
            Adicione uma nova aferição manual para manter o histórico clínico e
            o monitoramento do paciente atualizados.
          </p>
        </div>

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Aferição registrada com sucesso! Redirecionando para o histórico...
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
                Aferição vinculada ao paciente:
              </span>
              <p className="text-sm font-bold">
                {idoso.nome}
                {typeof idoso.idade === "number" ? ` (${idoso.idade} anos)` : ""}
              </p>
              {(idoso.cpf || idoso.telefone || idoso.endereco) && (
                <p className="mt-0.5 text-xs text-gray-600">
                  {[
                    idoso.cpf ? `CPF: ${formatarCpf(idoso.cpf)}` : null,
                    idoso.telefone ? `Tel: ${idoso.telefone}` : null,
                    idoso.endereco ? idoso.endereco : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}
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
                <HeartPulse size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações do indicador
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Selecione o indicador cadastrado e informe o valor aferido.
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
                {carregandoIndicadores ? (
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin text-[#1565C0]" />
                    Carregando indicadores...
                  </div>
                ) : (
                  <select
                    id="indicador"
                    value={indicadorId}
                    disabled={indicadores.length === 0}
                    onChange={(e) => handleIndicadorChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 disabled:bg-gray-100"
                  >
                    {indicadores.length === 0 ? (
                      <option value="">Nenhum indicador disponível</option>
                    ) : (
                      indicadores.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nome}
                        </option>
                      ))
                    )}
                  </select>
                )}
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
                  value={valorInput}
                  onChange={(e) => setValorInput(e.target.value)}
                  placeholder={ehPressaoArterial ? "Ex.: 120/80" : "Ex.: 74"}
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
                  value={unidade}
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600 outline-none"
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
                Este registro será salvo com origem manual e vinculado ao
                profissional/cuidador autenticado e ao paciente selecionado,
                integrando-se às coletas automáticas no histórico clínico.
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
              disabled={salvando || carregandoIndicadores || !idoso?.id}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Registrando..." : "Salvar registro"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}