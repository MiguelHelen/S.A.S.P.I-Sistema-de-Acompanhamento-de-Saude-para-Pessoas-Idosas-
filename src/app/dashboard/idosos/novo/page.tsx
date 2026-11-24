"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { calcularIdadeReal } from "@/components/PatientSelector";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  isAdminPerfil,
  validarEObterClinicaId,
} from "@/lib/clinica";
import {
  ArrowLeft,
  UserPlus,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function NovoIdosoPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [clinicaId, setClinicaId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    data_nascimento: "",
    telefone_emergencia: "",
    condicoes: "",
  });

  useEffect(() => {
    const sessao = getUsuarioSessao();
    if (!sessao || !isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      return;
    }

    setAutorizado(true);
    try {
      const id = validarEObterClinicaId(sessao);
      setClinicaId(id);
    } catch (err: any) {
      setErro(err.message);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    if (!clinicaId) {
      setErro("Clínica não identificada na sessão do administrador.");
      setSalvando(false);
      return;
    }

    const nomeLimpo = formData.nome.trim();
    if (!nomeLimpo) {
      setErro("Informe o nome completo do paciente.");
      setSalvando(false);
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.data_nascimento)) {
      setErro("Informe uma data de nascimento válida.");
      setSalvando(false);
      return;
    }

    const idadeCalculada = calcularIdadeReal(formData.data_nascimento);
    if (idadeCalculada <= 0 || idadeCalculada > 130) {
      setErro("A data de nascimento informada não corresponde a uma idade válida.");
      setSalvando(false);
      return;
    }

    try {
      const payload = {
        nome: nomeLimpo,
        data_nascimento: formData.data_nascimento,
        idade: idadeCalculada,
        clinica_id: clinicaId,
        telefone_emergencia:
          formData.telefone_emergencia.trim() || undefined,
        condicoes: formData.condicoes.trim() || undefined,
      };

      const res = await fetch(`${API_URL}/idoso`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(msg || "Não foi possível cadastrar o paciente.");
      }

      window.dispatchEvent(new Event("saspi_elderly_updated"));
      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/idosos");
      }, 1200);
    } catch (err: any) {
      setErro(err.message || "Erro ao cadastrar paciente.");
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
            Apenas Administradores podem cadastrar novos pacientes na clínica.
          </p>
        </div>
      </main>
    );
  }

  const idadePreview = calcularIdadeReal(formData.data_nascimento);

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/idosos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para pacientes
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Admissão de Paciente
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Paciente Idoso
          </h1>
          <p className="mt-2 text-gray-600">
            Preencha os dados cadastrais e clínicos iniciais para iniciar o
            acompanhamento no S.A.S.P.I.
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
              Paciente cadastrado com sucesso! Redirecionando...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <UserPlus size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Identificação e Informações Clínicas
                </h2>
                <p className="text-xs text-gray-500">
                  A idade será calculada automaticamente a partir da data de
                  nascimento.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Nome completo do paciente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex.: Sr. Antônio Carlos Pereira"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Data de nascimento *
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={formData.data_nascimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_nascimento: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
                {idadePreview > 0 && (
                  <p className="mt-1.5 text-xs font-medium text-[#1565C0]">
                    Idade calculada: {idadePreview} anos
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Telefone de emergência
                </label>
                <input
                  type="text"
                  value={formData.telefone_emergencia}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefone_emergencia: e.target.value,
                    })
                  }
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Condições clínicas, alergias ou observações gerais
                </label>
                <textarea
                  rows={4}
                  value={formData.condicoes}
                  onChange={(e) =>
                    setFormData({ ...formData, condicoes: e.target.value })
                  }
                  placeholder="Ex.: Hipertensão arterial controlada, diabetes tipo 2, alergia a dipirona..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/idosos"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando || !clinicaId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm hover:bg-[#0A2540] disabled:opacity-70"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Cadastrando..." : "Salvar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}