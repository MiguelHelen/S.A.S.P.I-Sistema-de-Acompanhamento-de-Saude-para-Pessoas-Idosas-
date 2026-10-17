import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { FileText, Info, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Sobre a plataforma",
    text: "O S.A.S.P.I. (Sistema de Acompanhamento de Saúde para Pessoas Idosas) é uma proposta de plataforma digital destinada a apoiar a organização de informações e atividades relacionadas ao acompanhamento da saúde, aproximando pessoas idosas, familiares, cuidadores e profissionais autorizados.",
  },
  {
    title: "Aceitação dos termos",
    text: "Ao utilizar os recursos disponibilizados, o usuário declara que leu e compreendeu estes termos. Caso não concorde com as condições apresentadas, deverá interromper a utilização da plataforma e buscar esclarecimentos com a equipe responsável.",
  },
  {
    title: "Responsabilidades dos usuários",
    text: "Os usuários devem fornecer informações corretas quando realizarem registros, manter seus meios de acesso protegidos, respeitar a privacidade de terceiros e utilizar a plataforma apenas para as finalidades propostas. Familiares, cuidadores e profissionais devem acessar somente as informações para as quais tenham autorização legítima.",
  },
  {
    title: "Registros e uso das informações",
    text: "As informações inseridas devem ser utilizadas para as finalidades informadas no contexto do sistema, como organização de registros, acompanhamento de compromissos e comunicação entre pessoas autorizadas. O tratamento de dados pessoais deve observar a legislação aplicável e os direitos dos titulares.",
  },
  {
    title: "Consentimento e representação",
    text: "Quando houver tratamento de dados pessoais, especialmente dados pessoais sensíveis referentes à saúde, devem ser observadas as bases legais aplicáveis e, quando necessário, obtido consentimento livre, informado e inequívoco do titular ou de seu representante legal. O consentimento não afasta outros deveres previstos em lei e pode ser revogado nos termos da legislação aplicável.",
  },
  {
    title: "Limitações da plataforma",
    text: "O S.A.S.P.I. é uma ferramenta de apoio à organização e ao acompanhamento de informações. Não substitui consultas, exames, atendimento de emergência, diagnóstico, prescrição ou orientação de profissionais de saúde. Decisões clínicas devem ser tomadas por profissionais habilitados, com base em avaliação adequada.",
  },
  {
    title: "Segurança e acesso",
    text: "Cada usuário deve preservar a confidencialidade de suas credenciais e comunicar à equipe responsável qualquer suspeita de acesso indevido. As permissões de acesso devem respeitar as funções de cada perfil e não autorizam o compartilhamento informal de dados pessoais ou de saúde.",
  },
  {
    title: "Alterações dos termos e contato",
    text: "Estes termos poderão ser revisados para refletir mudanças no projeto, nos recursos ou nas exigências legais. A versão atualizada deverá indicar sua data de publicação. Dúvidas sobre este documento podem ser encaminhadas pelos canais informados na página de contato.",
  },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <PageHero
        eyebrow="Termos de uso e consentimento"
        title="Termos de Uso e Consentimento"
        description="Leia as condições de utilização do S.A.S.P.I. e as responsabilidades relacionadas ao uso da plataforma."
        icon={FileText}
        sideText="Transparência, responsabilidade e respeito aos direitos dos usuários."
        meta="Texto-base acadêmico — versão de outubro de 2026"
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_.7fr] lg:px-8">
        <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-8">
          <ol className="space-y-0">
            {sections.map((section, index) => (
              <li key={section.title} className="flex gap-4 border-b border-slate-100 py-5 last:border-b-0 last:pb-0 first:pt-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-700">{index + 1}</span>
                <div>
                  <h2 className="font-semibold text-[#0c2b4a]">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-white p-6">
            <ShieldCheck className="text-emerald-600" size={32} />
            <h2 className="mt-3 text-lg font-semibold text-emerald-800">Ponto importante</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) prevê regras específicas para o tratamento de dados pessoais, incluindo dados sensíveis relacionados à saúde.</p>
            <div className="mt-4 border-t border-emerald-100 pt-4 text-sm leading-6 text-slate-600">
              <p className="flex gap-2"><Info className="mt-0.5 shrink-0 text-sky-600" size={17} />O acesso às informações deve respeitar as autorizações e as finalidades previamente informadas.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0c2b4a]">Precisa esclarecer algum ponto?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Consulte as perguntas frequentes ou entre em contato com a equipe do projeto.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="/ajuda" className="text-sm font-semibold text-sky-700 hover:underline">Ver ajuda</a>
              <a href="/contato" className="text-sm font-semibold text-sky-700 hover:underline">Entrar em contato</a>
            </div>
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
