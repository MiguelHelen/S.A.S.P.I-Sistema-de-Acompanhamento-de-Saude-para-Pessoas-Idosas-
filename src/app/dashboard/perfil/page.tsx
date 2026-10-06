"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  Mail,
  Phone,
  Save,
  UserRound,
  ShieldCheck,
  IdCard,
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function Perfil() {
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados alinhados EXATAMENTE com a tabela 'usuario' do Prisma
  const [formData, setFormData] = useState({
    nome: "João Silva",
    email: "joao@email.com",
    telefone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    perfil: "FAMILIAR" // Vem do enum perfil_usuario do banco
  });

  // Em um cenário real, você buscaria esses dados da API/localStorage no useEffect
  useEffect(() => {
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        if (user.nome) setFormData(prev => ({ ...prev, nome: user.nome }));
        if (user.email) setFormData(prev => ({ ...prev, email: user.email }));
      } catch (e) {
        console.error("Erro ao ler usuário do localStorage");
      }
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);

    // Simula a requisição PUT /usuario para atualizar os dados no backend
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);
      
      // Atualiza o cache local para refletir na saudação do Dashboard
      localStorage.setItem("saspi_user", JSON.stringify({
        nome: formData.nome,
        email: formData.email
      }));

      setTimeout(() => setSucesso(false), 3000);
    }, 800);
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
          Minha conta
        </span>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
          Perfil de Usuário
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Consulte e atualize as informações de contato e acesso da sua conta.
        </p>

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Dados do perfil atualizados com sucesso!
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#E8F1FB] text-[#1565C0]">
              <UserRound size={36} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#0A2540]">
              {formData.nome.split(" ")[0]}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#26A69A]">
              <ShieldCheck size={16} />
              {formData.perfil}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Contato atual
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={17} className="text-[#1565C0]" />
                  <span className="truncate">{formData.email}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={17} className="text-[#26A69A]" />
                  {formData.telefone}
                </div>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                <UserRound size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações Cadastrais
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Altere seus dados pessoais. O seu perfil de acesso não pode ser alterado por aqui.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="nome" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Nome completo
                </label>
                <div className="relative">
                  <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="nome"
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
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
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
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
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="perfil" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Perfil de Acesso
                </label>
                <div className="relative">
                  <ShieldCheck size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="perfil"
                    type="text"
                    readOnly
                    value={formData.perfil}
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold text-gray-600 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={salvando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:opacity-70 sm:w-auto"
              >
                {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}