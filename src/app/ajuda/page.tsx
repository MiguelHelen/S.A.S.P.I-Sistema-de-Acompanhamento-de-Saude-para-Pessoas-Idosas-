"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  Database,
  Headphones,
  MessageCircle,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

type CategoryId = "geral" | "cadastro" | "dados" | "funcionalidades" | "privacidade" | "suporte";
type FAQ = { id: string; category: CategoryId; question: string; answer: string };

const categories = [
  { id: "todas", label: "Todas as dúvidas", icon: MessageCircle },
  { id: "geral", label: "Geral", icon: CircleHelp },
  { id: "cadastro", label: "Cadastro e acesso", icon: UserRound },
  { id: "dados", label: "Dados e registros", icon: Database },
  { id: "funcionalidades", label: "Funcionalidades", icon: Settings2 },
  { id: "privacidade", label: "Segurança e privacidade", icon: ShieldCheck },
  { id: "suporte", label: "Suporte e contato", icon: Headphones },
] as const;

const faqs: FAQ[] = [
  { id: "what", category: "geral", question: "O que é o S.A.S.P.I.?", answer: "O S.A.S.P.I. é uma proposta de sistema digital para apoiar a organização de informações relacionadas à saúde de pessoas idosas e facilitar a comunicação entre o idoso, familiares, cuidadores e profissionais autorizados." },
  { id: "medical", category: "geral", question: "O sistema substitui consultas ou atendimento médico?", answer: "Não. A plataforma tem finalidade de apoio e organização. Ela não realiza diagnósticos, não prescreve tratamentos e não substitui consultas, exames, orientações de profissionais habilitados ou serviços de emergência." },
  { id: "users", category: "cadastro", question: "Quem pode utilizar o sistema?", answer: "A proposta contempla pessoas idosas e, conforme as permissões definidas, familiares, cuidadores e profissionais envolvidos no acompanhamento. Cada perfil deve acessar somente os recursos e informações autorizados." },
  { id: "account", category: "cadastro", question: "Como faço para criar uma conta?", answer: "O processo de cadastro depende da versão do sistema em uso. Nesta demonstração institucional, as páginas são estáticas e não criam contas reais; use o fluxo de cadastro disponibilizado na aplicação principal quando ele estiver integrado." },
  { id: "medicines", category: "dados", question: "Como são registrados os medicamentos?", answer: "Quando esse recurso estiver disponível, as informações devem ser cadastradas conforme a orientação recebida do profissional de saúde ou a prescrição vigente. Não altere doses, horários ou tratamentos com base apenas em lembretes do sistema." },
  { id: "records", category: "dados", question: "Posso acompanhar consultas, exames e registros de saúde?", answer: "Esse é um dos objetivos do projeto: ajudar a organizar informações e compromissos relevantes. A disponibilidade e os detalhes dos registros dependem dos recursos que forem implementados na aplicação principal." },
  { id: "wearable", category: "funcionalidades", question: "É necessário usar uma pulseira inteligente?", answer: "Não necessariamente. A integração com dispositivos vestíveis é considerada um recurso opcional do projeto e depende da compatibilidade técnica, das permissões e da implementação. O sistema não deve exigir um dispositivo sem informar essa condição ao usuário." },
  { id: "healthconnect", category: "funcionalidades", question: "O que é o Health Connect?", answer: "O Health Connect é uma tecnologia do ecossistema Android que pode permitir, com permissões específicas, a troca de certos dados de saúde e atividade entre aplicativos compatíveis. A integração com o S.A.S.P.I. depende de desenvolvimento e testes próprios." },
  { id: "sharing", category: "privacidade", question: "Quem pode ver os dados de saúde?", answer: "O acesso deve ser limitado às pessoas autorizadas e às finalidades informadas. Dados de saúde são dados pessoais sensíveis; consulte a Política de Privacidade e os Termos de Uso para entender os princípios previstos pelo projeto." },
  { id: "delete", category: "privacidade", question: "Como posso solicitar correção ou exclusão de dados?", answer: "Quando houver tratamento real de dados, as solicitações devem ser encaminhadas pelo canal oficial definido pelo responsável pelo tratamento. Os pedidos serão analisados conforme a LGPD e as obrigações legais aplicáveis." },
  { id: "support", category: "suporte", question: "Como entro em contato com a equipe?", answer: "Acesse a página Contato para consultar os canais institucionais previstos e enviar uma mensagem demonstrativa. No protótipo atual, o formulário não envia dados para um servidor nem armazena a mensagem." },
];

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function AjudaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>("what");

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = normalizeText(search.trim());
    return faqs.filter((item) => {
      const categoryMatches = selectedCategory === "todas" || item.category === selectedCategory;
      const queryMatches = !normalizedQuery || normalizeText(`${item.question} ${item.answer}`).includes(normalizedQuery);
      return categoryMatches && queryMatches;
    });
  }, [selectedCategory, search]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <PageHero
        eyebrow="Perguntas frequentes / ajuda"
        title="Como podemos ajudar?"
        description="Encontre respostas para dúvidas comuns sobre o funcionamento do S.A.S.P.I., os registros e a navegação. Se não encontrar o que procura, entre em contato com a equipe."
        icon={BookOpen}
        sideText="Informação clara para uma experiência mais tranquila."
      />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-[.72fr_1.6fr_.78fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 px-2 text-lg font-semibold text-[#0c2b4a]">Categorias</h2>
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = category.id === "todas" ? faqs.length : faqs.filter((item) => item.category === category.id).length;
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active ? "bg-sky-50 font-semibold text-sky-800 ring-1 ring-sky-100" : "text-slate-600 hover:bg-slate-50 hover:text-sky-700"}`}
                >
                  <Icon size={18} className={active ? "text-sky-700" : "text-slate-400"} />
                  <span className="flex-1">{category.label}</span>
                  <span className="text-xs text-slate-400">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-linear-to-br from-emerald-50 to-sky-50 p-4">
            <p className="font-semibold text-emerald-800">Ainda precisa de ajuda?</p>
            <p className="mt-1 text-sm leading-5 text-slate-600">Nossa equipe pode orientar você sobre o projeto.</p>
            <Link href="/contato" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline">Fale conosco <Headphones size={16} /></Link>
          </div>
        </aside>

        <section className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-6" aria-label="Lista de perguntas frequentes">
          <form onSubmit={(event) => event.preventDefault()} className="flex gap-2">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">Pesquisar perguntas</span>
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquise por uma palavra-chave..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Limpar pesquisa" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X size={16} /></button>}
            </label>
            <button type="button" onClick={() => setOpenId(filteredFaqs[0]?.id ?? null)} className="rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800">Pesquisar</button>
          </form>

          <div className="mt-6 flex items-start gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><MessageCircle size={22} /></span>
            <div>
              <h2 className="font-semibold text-[#0c2b4a]">Perguntas frequentes</h2>
              <p className="mt-1 text-sm text-slate-500">Selecione uma pergunta para ver a resposta.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {filteredFaqs.map((item) => {
              const expanded = openId === item.id;
              return (
                <article key={item.id} className={`overflow-hidden rounded-xl border transition-colors ${expanded ? "border-sky-200 bg-sky-50/50" : "border-slate-200 bg-white hover:border-sky-200"}`}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`answer-${item.id}`}
                      onClick={() => setOpenId(expanded ? null : item.id)}
                      className="flex w-full items-center gap-3 px-4 py-4 text-left"
                    >
                      <ChevronDown size={17} className={`shrink-0 text-sky-700 transition-transform ${expanded ? "rotate-180" : "-rotate-90"}`} />
                      <span className="flex-1 text-sm font-semibold text-[#0c2b4a]">{item.question}</span>
                    </button>
                  </h3>
                  {expanded && <div id={`answer-${item.id}`} className="border-t border-sky-100 px-4 py-4 pl-11 text-sm leading-6 text-slate-600">{item.answer}</div>}
                </article>
              );
            })}
            {filteredFaqs.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                <Search size={28} className="mx-auto text-slate-400" />
                <h3 className="mt-3 font-semibold text-[#0c2b4a]">Nenhuma pergunta encontrada</h3>
                <p className="mt-1 text-sm text-slate-500">Tente outro termo ou selecione uma categoria diferente.</p>
                <button type="button" onClick={() => { setSearch(""); setSelectedCategory("todas"); }} className="mt-4 text-sm font-semibold text-sky-700 hover:underline">Limpar filtros</button>
              </div>
            )}
          </div>
        </section>

        <aside className="h-fit space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-white p-5">
            <ShieldCheck size={29} className="text-emerald-600" />
            <h2 className="mt-3 font-semibold text-emerald-800">Precisa de ajuda direta?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use os canais de contato para enviar dúvidas, sugestões ou feedback sobre o projeto.</p>
            <Link href="/contato" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Abrir contato <Headphones size={16} /></Link>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
            <BookOpen size={28} className="text-violet-600" />
            <h2 className="mt-3 font-semibold text-violet-900">Sobre esta demonstração</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Esta área usa conteúdo estático no front-end. As respostas podem ser ajustadas conforme os recursos finais do sistema forem definidos.</p>
          </div>
        </aside>
      </section>
       <section id="contato" className="bg-[#0A2540] py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-[#67D5CA]">
                Contato
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Um projeto voltado ao acompanhamento e organização da saúde
              </h2>

              <p className="mt-4 max-w-2xl leading-relaxed text-blue-100">
                O S.A.S.P.I. está sendo desenvolvido como Trabalho de Conclusão
                de Curso em Desenvolvimento de Sistemas.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="font-semibold">S.A.S.P.I.</h3>

              <p className="mt-2 text-sm leading-relaxed text-blue-100">
                Sistema de Acompanhamento de Saúde para Pessoas Idosas.
              </p>

              <div className="mt-6 space-y-2 text-sm text-blue-100">
                <p>Projeto acadêmico</p>
                <p>Desenvolvimento de Sistemas</p>
                <p>2026</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-blue-100 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 S.A.S.P.I.</p>

            <p>Sistema de Acompanhamento de Saúde para Pessoas Idosas</p>
          </div>
        </div>
      </section>
    </main>
  );
}