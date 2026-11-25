"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  UserPlus,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  MailCheck,
  Info,
} from "lucide-react";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [clinicaId, setClinicaId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    perfil: "MEDICO",
    cpf: "",
    telefone: "",
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
    setEnviando(true);
    setErro("");
    setSucesso(false);

    if (!clinicaId) {
      setErro("Clínica não identificada na sessão do administrador.");
      setEnviando(false);
      return;
    }

    const cpfDigitos = formData.cpf.replace(/\D/g, "");
    if (cpfDigitos && cpfDigitos.length !== 11) {
      setErro("O CPF informado deve conter exatamente 11 dígitos numéricos.");
      setEnviando(false);
      return;
    }

    try {
      const payload = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        perfil: formData.perfil,
        clinica_id: clinicaId,
        ...(cpfDigitos ? { cpf: cpfDigitos } : {}),
        ...(formData.telefone.trim()
          ? { telefone: formData.telefone.trim() }
          : {}),
      };

      const res = await fetch(`${API_URL}/auth/convidar`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(
          msg || "Não foi possível enviar o convite institucional."
        );
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/usuarios");
      }, 1800);
    } catch (err: any) {
      setErro(err.message || "Erro ao disparar convite por e-mail.");
    } finally {
      setEnviando(false);
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
            Apenas Administradores podem convidar novos usuários para a
            clínica.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/usuarios"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para usuários
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Credenciamento Institucional
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Convidar Novo Usuário
          </h1>
          <p className="mt-2 text-gray-600">
            Envie um convite oficial de acesso para profissionais de saúde,
            familiares ou administradores da clínica.
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3.5 rounded-2xl border border-[#DCEAF8] bg-[#F8FBFE] p-4 text-sm text-[#0A2540]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
            <MailCheck size={19} />
          </div>
          <div>
            <p className="font-semibold">
              Ativação segura por link exclusivo (sem senha definida pelo admin)
            </p>
            <p className="mt-0.5 leading-relaxed text-gray-600">
              Ao confirmar, o sistema envia um e-mail com link de ativação para
              que o usuário cadastre sua própria senha (ou entre com Google).
              Enquanto não concluir o primeiro acesso, o cadastro permanece com
              status <strong>Convite Pendente</strong>.
            </p>
          </div>
        </div>

        {erro && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold">
                Não foi possível concluir o convite
              </p>
              <p className="mt-0.5 text-sm">{erro}</p>
            </div>
          </div>
        )}

        {sucesso && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <div>
              <p className="text-sm font-semibold">
                Convite enviado com sucesso para {formData.email}!
              </p>
              <p className="mt-0.5 text-sm text-emerald-800">
                O usuário foi registrado como <strong>Pendente</strong> e
                ativará sua conta ao acessar o link recebido por e-mail.
                Redirecionando...
              </p>
            </div>
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
                  Dados do Convidado e Perfil
                </h2>
                <p className="text-xs text-gray-500">
                  Informe o e-mail que será utilizado pelo convidado para
                  ativar sua credencial.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex.: Dra. Carlos Mendes"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  E-mail institucional ou pessoal *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="carlos@clinica.com.br"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Perfil de Acesso *
                </label>
                <select
                  value={formData.perfil}
                  onChange={(e) =>
                    setFormData({ ...formData, perfil: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="MEDICO">Médico (Acompanhamento clínico e prescrições)</option>
                  <option value="ENFERMEIRO">Enfermeiro(a) (Triagem e cuidados)</option>
                  <option value="CUIDADOR">Cuidador(a) (Apoio na rotina diária)</option>
                  <option value="FAMILIAR">Familiar (Acompanhamento remoto)</option>
                  <option value="ADMINISTRADOR">Administrador (Gestão da clínica)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  CPF (opcional)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpf: e.target.value.replace(/\D/g, "").slice(0, 11),
                    })
                  }
                  placeholder="11 dígitos numéricos"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
              <Info size={14} className="shrink-0 text-[#1565C0]" />
              <span>
                Para criar credenciais do aplicativo móvel de um paciente
                idoso, utilize o menu <strong>Idosos → Acesso App</strong>.
              </span>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/usuarios"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={enviando || !clinicaId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              {enviando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {enviando ? "Enviando convite..." : "Enviar Convite por E-mail"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}