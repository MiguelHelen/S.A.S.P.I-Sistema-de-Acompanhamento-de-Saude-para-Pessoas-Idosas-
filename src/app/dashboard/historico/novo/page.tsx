"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  API_URL,
  getAuthHeaders,
  getIdosoAtivoSessao,
  getUsuarioSessao,
  isAdminPerfil,
} from "@/lib/clinica";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldAlert,
} from "lucide-react";

export default function NovoRegistroClinicoPage() {
  const router = useRouter();
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const [tipo, setTipo] = useState("PRESSAO");
  const [valorNumerico, setValorNumerico] = useState("");
  const [valorCategorico, setValorCategorico] = useState("");
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    const sessao = getUsuarioSessao();
    if (!sessao || sessao.perfil === "FAMILIAR" || isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      return;
    }

    setAutorizado(true);

    const ativo = getIdosoAtivoSessao<Idoso>();
    if (ativo?.id) {
      setIdosoAtivo(ativo);
    }
  }, []);

  const isNumerico = ["BATIMENTOS", "SPO2", "TEMPERATURA", "GLICEMIA"].includes(
    tipo
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    if (!idosoAtivo?.id) {
      setErro("Selecione um paciente.");
      setSalvando(false);
      return;
    }

    const payload: Record<string, any> = {
      idoso_id: idosoAtivo.id,
      tipo,
      data_registro: new Date().toISOString(),
    };

    if (isNumerico) {
      const num = Number(valorNumerico.replace(",", "."));
      if (!valorNumerico || Number.isNaN(num)) {
        setErro("Informe um valor numérico válido.");
        setSalvando(false);
        return;
      }
      payload.valor_numerico = num;
      if (observacao.trim()) {
        payload.valor_categorico = observacao.trim();
      }
    } else {
      const textoFinal = observacao.trim()
        ? `${valorCategorico.trim()} — ${observacao.trim()}`
        : valorCategorico.trim();

      if (!textoFinal) {
        setErro("Preencha o valor ou evolução clínica.");
        setSalvando(false);
        return;
      }
      payload.valor_categorico = textoFinal;
    }

    try {
      const res = await fetch(`${API_URL}/registro-saude`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(msg || "Não foi possível salvar o registro.");
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/historico");
      }, 1200);
    } catch (err: any) {
      setErro(err.message || "Falha de conexão com o servidor.");
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
            Apenas profissionais da equipe clínica podem registrar evoluções ou
            sinais vitais no prontuário.
          </p>
          <a
            href="/dashboard/historico"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A2540]"
          >
            <ArrowLeft size={16} />
            Voltar para Histórico
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <a
          href="/dashboard/historico"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para histórico
        </a>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Aferição & Evolução
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Registro Clínico
          </h1>
          <p className="mt-2 text-gray-600">
            Insira uma medição manual ou anotação de acompanhamento para o
            prontuário.
          </p>
        </div>

        <div className="mt-6">
          <PatientSelector
            selectedId={idosoAtivo?.id}
            onSelect={(p) => setIdosoAtivo(p)}
          />
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
              Registro salvo com sucesso! Redirecionando...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Activity size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Parâmetro Clínico
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Tipo de registro *
                </label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    setTipo(e.target.value);
                    setValorNumerico("");
                    setValorCategorico("");
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="PRESSAO">Pressão Arterial (mmHg)</option>
                  <option value="BATIMENTOS">Frequência Cardíaca (bpm)</option>
                  <option value="SPO2">Oxigenação Sanguínea (SpO₂ %)</option>
                  <option value="TEMPERATURA">Temperatura Corporal (°C)</option>
                  <option value="GLICEMIA">Glicemia Capilar (mg/dL)</option>
                  <option value="EVOLUCAO">Evolução / Nota Clínica</option>
                </select>
              </div>

              {isNumerico ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Valor aferido *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={valorNumerico}
                    onChange={(e) => setValorNumerico(e.target.value)}
                    placeholder={
                      tipo === "TEMPERATURA"
                        ? "Ex.: 36.6"
                        : tipo === "SPO2"
                        ? "Ex.: 98"
                        : tipo === "GLICEMIA"
                        ? "Ex.: 105"
                        : "Ex.: 74"
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    {tipo === "PRESSAO"
                      ? "Leitura (Sistólica / Diastólica) *"
                      : "Resumo da evolução *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={valorCategorico}
                    onChange={(e) => setValorCategorico(e.target.value)}
                    placeholder={
                      tipo === "PRESSAO"
                        ? "Ex.: 120/80 mmHg"
                        : "Ex.: Paciente lúcido, hidratado e sem queixas"
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Observações adicionais (opcional)
                </label>
                <textarea
                  rows={3}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex.: Aferido em repouso antes do almoço..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <a
              href="/dashboard/historico"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm hover:bg-[#0A2540] disabled:opacity-70"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Salvando..." : "Salvar Registro"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}