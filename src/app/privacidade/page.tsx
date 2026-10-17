import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Database, FileText, LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";

const sections = [
  {
    title: "Quais dados podem ser tratados",
    text: "Conforme os recursos efetivamente disponibilizados, podem existir registros de identificação e contato, informações cadastradas sobre saúde, medicamentos, consultas, exames e dados necessários à organização do acompanhamento. Devem ser solicitados apenas os dados adequados e necessários para cada finalidade.",
  },
  {
    title: "Finalidade do tratamento",
    text: "As informações devem ser utilizadas de maneira compatível com as finalidades apresentadas ao usuário, como organizar registros, apoiar lembretes e facilitar a comunicação entre pessoas autorizadas. Os dados não devem ser utilizados para propósitos incompatíveis com essas finalidades.",
  },
  {
    title: "Compartilhamento e controle de acesso",
    text: "O acesso deve ser limitado a pessoas autorizadas e de acordo com suas funções. Qualquer compartilhamento com familiares, cuidadores, profissionais, clínicas ou fornecedores deve possuir fundamento válido, respeitar as permissões aplicáveis e observar a legislação de proteção de dados.",
  },
  {
    title: "Direitos do titular",
    text: "Nos termos da LGPD e conforme aplicável ao caso, o titular pode solicitar confirmação da existência de tratamento, acesso, correção de dados incompletos ou desatualizados, informações sobre compartilhamento e demais direitos previstos na legislação. A análise e o atendimento das solicitações devem seguir os procedimentos legais aplicáveis.",
  },
  {
    title: "Segurança das informações",
    text: "O projeto deve adotar medidas técnicas e administrativas adequadas ao contexto para reduzir riscos de acesso não autorizado, perda, alteração ou divulgação indevida. Nenhuma solução elimina totalmente os riscos, e incidentes devem ser tratados conforme os procedimentos e deveres legais aplicáveis.",
  },
  {
    title: "Retenção e exclusão",
    text: "Os dados devem ser mantidos pelo período necessário às finalidades informadas, observadas as obrigações legais e as hipóteses de conservação permitidas pela legislação. Os critérios e prazos efetivos de retenção devem ser definidos pelo responsável pelo tratamento antes do uso real da plataforma.",
  },
  {
    title: "Consentimento e dados de saúde",
    text: "Dados referentes à saúde são dados pessoais sensíveis na LGPD. Seu tratamento exige atenção especial à base legal aplicável, à transparência e aos direitos do titular. Quando o consentimento for a base utilizada, ele deverá cumprir os requisitos legais e poderá ser revogado conforme a legislação.",
  },
  {
    title: "Contato e atualização desta política",
    text: "Dúvidas e solicitações relacionadas à privacidade devem ser encaminhadas pelos canais oficiais indicados na página de contato. Esta política deverá ser atualizada quando houver mudanças relevantes no tratamento de dados ou nos recursos do sistema.",
  },
];

const principles = [
  { icon: LockKeyhole, title: "Proteção de dados", text: "Medidas proporcionais aos riscos e à natureza das informações." },
  { icon: UserCheck, title: "Controle de acesso", text: "Acesso restrito conforme a autorização e a função de cada usuário." },
  { icon: FileText, title: "Transparência", text: "Finalidades e orientações apresentadas de forma compreensível." },
  { icon: Database, title: "Uso responsável", text: "Tratamento limitado às finalidades adequadas e informadas." },
];

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <PageHero
        eyebrow="Política de privacidade e LGPD"
        title="Seus dados, nossa responsabilidade"
        description="Entenda os princípios que devem orientar a coleta, o uso, o acesso e a proteção de informações no contexto do S.A.S.P.I."
        icon={ShieldCheck}
        sideText="Cuidado com as pessoas também significa cuidado com seus dados."
        meta="Texto-base acadêmico — versão de outubro de 2026"
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={23} /></span>
                <h2 className="mt-3 font-semibold text-[#0c2b4a]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_.7fr]">
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
              <ShieldCheck size={34} className="text-emerald-600" />
              <h2 className="mt-3 text-lg font-semibold text-emerald-800">Compromisso com a privacidade</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">A LGPD (Lei nº 13.709/2018) estabelece regras para o tratamento de dados pessoais. As informações de saúde exigem cuidados adicionais por serem dados pessoais sensíveis.</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6">
              <h2 className="font-semibold text-[#0c2b4a]">Um limite importante</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">O S.A.S.P.I. é uma proposta de apoio ao acompanhamento. Não realiza diagnóstico nem substitui consultas ou orientações de profissionais de saúde.</p>
              <Link href="/contato" className="mt-4 inline-flex text-sm font-semibold text-sky-700 hover:underline">Dúvidas sobre seus dados →</Link>
            </div>
          </aside>
        </div>
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          Nota para a versão final do TCC: confirme as práticas reais do sistema, a identificação do responsável pelo tratamento, as bases legais, os canais para solicitações e os prazos de retenção antes de publicar esta política como documento definitivo.
        </p>
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
