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
} from "@/lib/clinica";
import {
  ArrowLeft,
  Pill,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function NovaPrescricaoPage() {
  const router = useRouter();
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [medicoId, setMedicoId] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    nome_medicamento: "",
    dosagem: "",
    frequencia: "",
    horarios: "",
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    orientacoes: "",
  });

  useEffect(() => {
    const sessao = getUsuarioSessao();
    if (!sessao || sessao.perfil !== "MEDICO") {
      setAutorizado(false);
      return;
    }

    setAutorizado(true);
    setMedicoId(sessao.id);

    const ativo = getIdosoAtivoSessao<Idoso>();
    if (ativo?.id) {
      setIdosoAtivo(ativo);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    if (!idosoAtivo?.id) {
      setErro("Selecione um paciente.");
      setSalvando(false);
      return;
    }

    if (!medicoId) {
      setErro(
        "Sessão do médico não encontrada. Faça login novamente para prescrever."
      );
      setSalvando(false);
      return;
    }

    const nomeMedLimpo = formData.nome_medicamento.trim();
    const dosagemLimpa = formData.dosagem.trim();
    const frequenciaLimpa = formData.frequencia.trim();
    const orientacoesLimpas = formData.orientacoes.trim();
    const horariosLimpos = formData.horarios.trim();

    if (!nomeMedLimpo || !dosagemLimpa || !frequenciaLimpa) {
      setErro("Preencha o nome do medicamento, a dosagem e a frequência.");
      setSalvando(false);
      return;
    }

    const headersJson = getAuthHeaders(true);
    const headersGet = getAuthHeaders(false);

    try {
      let medicamentoId: string | null = null;

      // 1. Verifica se medicamento já existe no catálogo global antes de criar
      const buscaRes = await fetch(`${API_URL}/medicamento`, {
        headers: headersGet,
      }).catch(() => null);

      if (buscaRes?.ok) {
        const listaRaw = await buscaRes.json();
        const lista = Array.isArray(listaRaw) ? listaRaw : listaRaw?.data || [];
        const existente = lista.find(
          (m: any) =>
            String(m.nome || "").trim().toLowerCase() ===
            nomeMedLimpo.toLowerCase()
        );
        if (existente?.id) {
          medicamentoId = existente.id;
        }
      }

      // 2. Se não existir no catálogo, cria o medicamento
      if (!medicamentoId) {
        const medRes = await fetch(`${API_URL}/medicamento`, {
          method: "POST",
          headers: headersJson,
          body: JSON.stringify({
            nome: nomeMedLimpo,
            descricao: orientacoesLimpas || undefined,
          }),
        });

        const medData = await medRes.json().catch(() => null);

        if (!medRes.ok) {
          const msgErro = Array.isArray(medData?.message)
            ? medData.message.join(", ")
            : medData?.message || "Erro ao registrar medicamento no catálogo.";
          throw new Error(msgErro);
        }

        medicamentoId = medData?.id || medData?.data?.id;
      }

      if (!medicamentoId) {
        throw new Error("Não foi possível obter o identificador do medicamento.");
      }

      // 3. Cria a prescrição vinculando idoso, médico e medicamento
      const horariosComObs =
        orientacoesLimpas && horariosLimpos
          ? `${horariosLimpos} | Obs: ${orientacoesLimpas}`
          : orientacoesLimpas
          ? `Obs: ${orientacoesLimpas}`
          : horariosLimpos || undefined;

      const prescPayload: Record<string, any> = {
        idoso_id: idosoAtivo.id,
        medico_id: medicoId,
        medicamento_id: medicamentoId,
        dosagem: dosagemLimpa,
        frequencia: frequenciaLimpa,
        horarios: horariosComObs,
        data_inicio: formData.data_inicio,
        ativo: true,
      };

      if (formData.data_fim && /^\d{4}-\d{2}-\d{2}$/.test(formData.data_fim)) {
        prescPayload.data_fim = formData.data_fim;
      }

      const prescRes = await fetch(`${API_URL}/prescricao`, {
        method: "POST",
        headers: headersJson,
        body: JSON.stringify(prescPayload),
      });

      const prescData = await prescRes.json().catch(() => null);

      if (!prescRes.ok) {
        const msgErro = Array.isArray(prescData?.message)
          ? prescData.message.join(", ")
          : prescData?.message || "Erro ao salvar prescrição.";
        throw new Error(msgErro);
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/medicamentos");
      }, 1200);
    } catch (err: any) {
      setErro(
        err.message ||
          "Erro de comunicação ao registrar prescrição. Verifique os dados."
      );
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
            Acesso Restrito ao Perfil Médico
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Apenas usuários com perfil <strong>Médico</strong> podem emitir
            novas prescrições medicamentosas no S.A.S.P.I.
          </p>
          <a
            href="/dashboard/medicamentos"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A2540]"
          >
            <ArrowLeft size={16} />
            Voltar para Medicamentos
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
          href="/dashboard/medicamentos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para prescrições
        </a>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Prescrição Médica
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Medicamento
          </h1>
          <p className="mt-2 text-gray-600">
            Adicione uma medicação ao plano terapêutico e sincronize os
            lembretes do paciente.
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
              Prescrição registrada com sucesso! Redirecionando...
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
                  Dados do Medicamento e Posologia
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Nome do medicamento (Princípio ativo ou comercial) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome_medicamento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nome_medicamento: e.target.value,
                    })
                  }
                  placeholder="Ex.: Losartana Potássica"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Dosagem *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dosagem}
                  onChange={(e) =>
                    setFormData({ ...formData, dosagem: e.target.value })
                  }
                  placeholder="Ex.: 50mg (1 comprimido)"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Frequência *
                </label>
                <input
                  type="text"
                  required
                  value={formData.frequencia}
                  onChange={(e) =>
                    setFormData({ ...formData, frequencia: e.target.value })
                  }
                  placeholder="Ex.: A cada 12 horas (2x ao dia)"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Horários programados
                </label>
                <input
                  type="text"
                  value={formData.horarios}
                  onChange={(e) =>
                    setFormData({ ...formData, horarios: e.target.value })
                  }
                  placeholder="Ex.: 08:00 e 20:00"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Data de início *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, data_inicio: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Data de término (opcional)
                </label>
                <input
                  type="date"
                  min={formData.data_inicio}
                  value={formData.data_fim}
                  onChange={(e) =>
                    setFormData({ ...formData, data_fim: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Orientações clínicas (opcional)
                </label>
                <textarea
                  rows={3}
                  value={formData.orientacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, orientacoes: e.target.value })
                  }
                  placeholder="Ex.: Administrar após o café da manhã com água..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <a
              href="/dashboard/medicamentos"
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
              {salvando ? "Salvando..." : "Salvar Prescrição"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}