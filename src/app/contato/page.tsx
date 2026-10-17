"use client";

import { useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { CheckCircle2, Clock3, Headphones, Mail, MapPin, MessageSquareText, Send, ShieldCheck, UsersRound } from "lucide-react";

const contactCards = [
  { icon: Mail, title: "E-mail institucional", value: "contato@saspi.com.br", detail: "Dúvidas gerais, sugestões e parcerias." },
  { icon: Headphones, title: "Suporte técnico", value: "suporte@saspi.com.br", detail: "Questões sobre acesso e funcionamento." },
  { icon: UsersRound, title: "Equipe do projeto", value: "equipe@saspi.com.br", detail: "Informações sobre o TCC e a apresentação." },
  { icon: MapPin, title: "Localização", value: "São Paulo — SP", detail: "Atendimento presencial somente quando previamente combinado." },
];

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

export default function ContatoPage() {
  const [characterCount, setCharacterCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Envio simulado: não há API, banco de dados ou persistência nesta página.
    setSubmitted(true);
    setCharacterCount(0);
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <PageHero
        eyebrow="Entre em contato"
        title="Estamos aqui para ajudar"
        description="Tem alguma dúvida, sugestão ou feedback sobre o S.A.S.P.I.? Nossa equipe está disponível para esclarecer informações sobre o projeto e seu funcionamento."
        icon={MessageSquareText}
        sideText="Juntos por um envelhecimento mais saudável, seguro e acolhedor."
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Nossos canais</p>
          <h2 className="mt-2 text-2xl font-bold text-[#0c2b4a]">Fale com a nossa equipe</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Escolha o canal mais adequado para sua dúvida ou envie uma mensagem pelo formulário.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {contactCards.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={23} /></span>
                  <h3 className="mt-3 font-semibold text-[#0c2b4a]">{item.title}</h3>
                  <p className="mt-1 wrap-break-word text-sm font-medium text-sky-700">{item.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-4 flex items-start gap-4 rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 to-sky-50 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700"><Clock3 size={25} /></span>
            <div>
              <h3 className="font-semibold text-emerald-800">Atendimento da equipe</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Os canais acima são exemplos para o protótipo. Confirme os endereços e a disponibilidade reais antes de publicar o site.</p>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="contact-form-title">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Send size={22} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">Envie uma mensagem</p>
              <h2 id="contact-form-title" className="mt-1 text-2xl font-bold text-[#0c2b4a]">Fale conosco</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Preencha os campos abaixo. Nesta versão, o envio é apenas demonstrativo.</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Nome completo <span className="text-rose-500">*</span>
                <input name="name" autoComplete="name" required maxLength={100} placeholder="Digite seu nome" className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-slate-700">E-mail <span className="text-rose-500">*</span>
                <input name="email" type="email" autoComplete="email" required maxLength={150} placeholder="Digite seu e-mail" className={inputClass} />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Assunto <span className="text-rose-500">*</span>
              <select name="subject" required defaultValue="" className={inputClass}>
                <option value="" disabled>Selecione uma opção</option>
                <option value="duvida">Dúvida geral</option>
                <option value="suporte">Suporte técnico</option>
                <option value="privacidade">Privacidade e dados</option>
                <option value="sugestao">Sugestão ou feedback</option>
                <option value="academico">Projeto acadêmico / TCC</option>
                <option value="outro">Outro assunto</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Mensagem <span className="text-rose-500">*</span>
              <textarea
                name="message"
                required
                rows={5}
                maxLength={500}
                placeholder="Digite sua mensagem aqui..."
                onChange={(event) => setCharacterCount(event.target.value.length)}
                className={`${inputClass} resize-y`}
              />
              <span className="mt-1 block text-right text-xs text-slate-400">{characterCount}/500 caracteres</span>
            </label>

            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-xs leading-5 text-slate-600">
              <p className="flex gap-2"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" />Por segurança, não inclua informações clínicas, documentos ou outros dados sensíveis neste formulário de demonstração.</p>
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
              <Send size={17} /> Enviar mensagem
            </button>
            {submitted && (
              <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold">Demonstração concluída!</p>
                  <p className="mt-1 leading-5">A interface simulou o envio. Nenhuma mensagem foi transmitida ou armazenada, pois esta página ainda não está conectada a um servidor.</p>
                </div>
              </div>
            )}
          </form>
        </section>
      </section>

      <Footer />
    </main>
  );
}