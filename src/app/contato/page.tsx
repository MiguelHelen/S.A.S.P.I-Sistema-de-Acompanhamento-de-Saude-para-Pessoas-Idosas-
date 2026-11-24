"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Mail,
  Building2,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

export default function ContatoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const assunto = encodeURIComponent(
      `[S.A.S.P.I.] Contato Institucional — ${instituicao || nome}`
    );
    const corpo = encodeURIComponent(
      `Nome: ${nome}\nE-mail: ${email}\nInstituição/Clínica: ${instituicao || "Não informada"}\n\nMensagem:\n${mensagem}`
    );

    setEnviado(true);
    if (typeof window !== "undefined") {
      window.location.href = `mailto:suporte@saspi.com.br?subject=${assunto}&body=${corpo}`;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F7FB]">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F4EF] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#26A69A]">
              <MessageSquare size={14} />
              Atendimento Institucional
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#0A2540] md:text-5xl">
              Contato
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              Entre em contato com a equipe do S.A.S.P.I. para dúvidas sobre
              implantação em clínicas, credenciamento de profissionais ou
              suporte técnico.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Mail size={20} />
                </div>
                <h2 className="mt-4 font-semibold text-[#0A2540]">
                  Suporte Técnico e Credenciamento
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  suporte@saspi.com.br
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                  <Building2 size={20} />
                </div>
                <h2 className="mt-4 font-semibold text-[#0A2540]">
                  Implantação para Clínicas e ILPIs
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Cadastro de unidades, configuração de administradores e
                  integração com dispositivos vestíveis.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Clock size={20} />
                </div>
                <h2 className="mt-4 font-semibold text-[#0A2540]">
                  Horário de Atendimento
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Segunda a sexta-feira, das 08h às 18h (horário de Brasília).
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
              <h2 className="text-xl font-bold text-[#0A2540]">
                Enviar Mensagem
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Preencha os dados abaixo para iniciar o atendimento com nossa
                equipe.
              </p>

              {enviado && (
                <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <div>
                    <p className="font-semibold">
                      Solicitação preparada com sucesso!
                    </p>
                    <p className="mt-0.5">
                      Seu aplicativo de e-mail foi acionado para concluir o
                      envio para <strong>suporte@saspi.com.br</strong>.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex.: Dra. Ana Oliveira"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                      E-mail para retorno *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ana@clinica.com.br"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Clínica ou Instituição (opcional)
                  </label>
                  <input
                    type="text"
                    value={instituicao}
                    onChange={(e) => setInstituicao(e.target.value)}
                    placeholder="Nome da clínica, consultório ou residência geriátrica"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Mensagem *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Descreva sua solicitação, dúvida técnica ou necessidade de credenciamento..."
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A2540]"
                  >
                    <Send size={16} />
                    Enviar Solicitação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}