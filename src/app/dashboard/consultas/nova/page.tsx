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
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function NovaConsultaPage() {
  const router = useRouter();
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    especialidade: "",
    medico: "",
    data: "",
    horario: "09:00",
    localizacao: "",
    observacao: "",
  });

  useEffect(() => {
    const sessao = getUsuarioSessao();
    if (!sessao || sessao.perfil === "FAMILIAR" || isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      return;
    }

    setAutorizado(true);
    if (sessao.perfil === "MEDICO" && sessao.nome) {
      setFormData((prev) => ({ ...prev, medico: sessao.nome }));
    }

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

    if (!formData.medico.trim()) {
      setErro("Informe o nome do médico ou profissional responsável.");
      setSalvando(false);
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.data)) {
      setErro("Selecione uma data válida no calendário.");
      setSalvando(false);
      return;
    }

    const ano = Number(formData.data.split("-")[0]);
    if (Number.isNaN(ano) || ano < 2000 || ano > 2100) {
      setErro("Informe um ano válido para a consulta.");
      setSalvando(false);
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(formData.horario)) {
      setErro("Informe um horário válido.");
      setSalvando(false);
      return;
    }

    if (!formData.localizacao.trim()) {
      setErro("Informe o local ou unidade de atendimento.");
      setSalvando(false);
      return;
    }

    try {
      const payload = {
        idoso_id: idosoAtivo.id,
        especialidade: formData.especialidade.trim(),
        medico: formData.medico.trim(),
        data: formData.data,
        horario: formData.horario.trim(),
        localizacao: formData.localizacao.trim(),
        ...(formData.observacao.trim()
          ? { observacao: formData.observacao.trim() }
          : {}),
        status: "Agendada",
      };

      const res = await fetch(`${API_URL}/consulta`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        const msgErro = Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message || "Erro ao agendar consulta.";
        throw new Error(msgErro);
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/consultas");
      }, 1000);
    } catch (err: any) {
      setErro(
        err.message ||
          "Erro de comunicação ao agendar consulta. Verifique a data e os campos."
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
            Acesso Restrito
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Apenas profissionais da equipe clínica podem agendar novas consultas
            no S.A.S.P.I.
          </p>
          <a
            href="/dashboard/consultas"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A2540]"
          >
            <ArrowLeft size={16} />
            Voltar para Consultas
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
          href="/dashboard/consultas"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para consultas
        </a>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Agendamento Clínico
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Agendar Consulta
          </h1>
          <p className="mt-2 text-gray-600">
            Marque um atendimento médico ou retorno e notifique os responsáveis
            pelo paciente.
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
              Consulta agendada com sucesso! Redirecionando...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Calendar size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Detalhes do Atendimento
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Especialidade ou Tipo de Consulta *
                </label>
                <input
                  type="text"
                  required
                  value={formData.especialidade}
                  onChange={(e) =>
                    setFormData({ ...formData, especialidade: e.target.value })
                  }
                  placeholder="Ex.: Cardiologia, Geriatria, Retorno"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Médico / Profissional *
                </label>
                <input
                  type="text"
                  required
                  value={formData.medico}
                  onChange={(e) =>
                    setFormData({ ...formData, medico: e.target.value })
                  }
                  placeholder="Ex.: Dr. Carlos Mendes"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Horário *
                </label>
                <input
                  type="time"
                  required
                  value={formData.horario}
                  onChange={(e) =>
                    setFormData({ ...formData, horario: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Local / Unidade de Atendimento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.localizacao}
                  onChange={(e) =>
                    setFormData({ ...formData, localizacao: e.target.value })
                  }
                  placeholder="Ex.: Clínica Geriátrica Central - Sala 302 ou Teleconsulta"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Observações e preparos (opcional)
                </label>
                <textarea
                  rows={3}
                  value={formData.observacao}
                  onChange={(e) =>
                    setFormData({ ...formData, observacao: e.target.value })
                  }
                  placeholder="Ex.: Levar exames laboratoriais recentes e receituário em uso..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <a
              href="/dashboard/consultas"
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
              {salvando ? "Agendando..." : "Confirmar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}