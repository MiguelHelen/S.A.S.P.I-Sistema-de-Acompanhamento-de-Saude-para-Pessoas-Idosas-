"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  Mail,
  Phone,
  Save,
  UserRound,
  ShieldCheck,
  IdCard,
  Loader2,
  CheckCircle2,
  Users
} from "lucide-react";

export default function NovoUsuario() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados mapeados para a tabela 'usuario' do Prisma
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    perfil: "CUIDADOR", // Valores do enum perfil_usuario do banco
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    // No backend real, a API pegará o clinica_id do token de quem está logado (Admin)
    // e criará o vínculo automaticamente no banco.
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard"); // Futuramente redirecionará para /dashboard/usuarios
      }, 1500);
    }, 800);
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para o Dashboard
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Gestão de Acessos
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Usuário
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Cadastre membros da rede de apoio (familiares e cuidadores) ou profissionais clínicos da instituição.
          </p>
        </div>

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Usuário cadastrado com sucesso! O convite de acesso foi enviado.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Users size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Dados do Usuário
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Preencha as informações pessoais e defina o nível de permissão.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="nome" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Nome completo *
                </label>
                <div className="relative">
                  <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="nome"
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex.: Carlos de Almeida"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="E-mail para login"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telefone" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Telefone
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 90000-0000"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cpf" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  CPF
                </label>
                <div className="relative">
                  <IdCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="perfil" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Perfil de Acesso *
                </label>
                <div className="relative">
                  <ShieldCheck size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1565C0]" />
                  <select
                    id="perfil"
                    required
                    value={formData.perfil}
                    onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#0A2540] outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="FAMILIAR">Familiar (Visualização)</option>
                    <option value="CUIDADOR">Cuidador (Apoio na rotina)</option>
                    <option value="ENFERMEIRO">Enfermeiro (Registros clínicos)</option>
                    <option value="MEDICO">Médico (Gestão clínica)</option>
                    <option value="ADMINISTRADOR">Administrador (Gestão de clínica)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-[#DCEAF8] bg-[#F8FBFE] p-5">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#1565C0]" />
            <p className="text-sm leading-relaxed text-gray-600">
              O novo usuário será vinculado automaticamente à mesma clínica/organização da sua conta atual de administrador. Uma senha temporária será enviada para o e-mail cadastrado.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:opacity-70"
            >
              {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {salvando ? "Cadastrando..." : "Cadastrar usuário"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}