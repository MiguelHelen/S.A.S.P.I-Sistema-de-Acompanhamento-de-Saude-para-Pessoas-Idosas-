"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Smartphone,
  Users,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

interface ItemFaq {
  pergunta: string;
  resposta: string;
}

const PERGUNTAS_FREQUENTES: ItemFaq[] = [
  {
    pergunta: "Como obtenho acesso ao painel web do S.A.S.P.I.?",
    resposta:
      "O acesso ao painel web é concedido por meio de pré-cadastro institucional realizado pelo Administrador da clínica ou instituição de saúde. Após o cadastro do seu e-mail e perfil (Médico, Enfermeiro, Cuidador ou Familiar), você poderá entrar com e-mail e senha ou via conta Google vinculada.",
  },
  {
    pergunta: "Como o idoso acessa o aplicativo móvel?",
    resposta:
      "O Administrador da clínica gera as credenciais exclusivas do aplicativo na seção 'Idosos > Acesso App' do painel. O idoso utiliza o e-mail e a senha configurados diretamente no aplicativo móvel S.A.S.P.I. para acompanhar lembretes de medicamentos, consultas e registrar leituras.",
  },
  {
    pergunta: "Qual a diferença de permissão entre Médico, Cuidador e Familiar?",
    resposta:
      "Médicos podem registrar sinais vitais, agendar consultas, prescrever e encerrar medicamentos. Enfermeiros e Cuidadores registram aferições vitais, confirmam administração de doses e gerenciam agendamentos. Familiares possuem acesso em modo de acompanhamento (somente leitura) aos dados dos idosos vinculados.",
  },
  {
    pergunta: "Como funciona o monitoramento em tempo real dos sinais vitais?",
    resposta:
      "Quando o dispositivo vestível (smartband) ou o aplicativo móvel envia uma nova leitura de frequência cardíaca, oxigenação (SpO₂), temperatura ou pressão arterial, o painel clínico atualiza os indicadores automaticamente e emite alertas visuais caso algum parâmetro saia da faixa fisiológica esperada.",
  },
  {
    pergunta: "Esqueci minha senha de acesso. Como redefinir?",
    resposta:
      "Na tela de login, clique em 'Esqueci minha senha' ou acesse diretamente a página de recuperação de senha, informe seu e-mail cadastrado e siga o link enviado para cadastrar uma nova credencial.",
  },
];

export default function AjudaPage() {
  const [abertaIndex, setAbertaIndex] = useState<number | null>(0);

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F7FB]">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F1FB] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
              <HelpCircle size={14} />
              Suporte e Orientações
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#0A2540] md:text-5xl">
              Central de Ajuda
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              Consulte as orientações sobre credenciamento institucional, perfis
              de acesso, acompanhamento de sinais vitais e integração com o
              aplicativo do idoso.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {PERGUNTAS_FREQUENTES.map((item, idx) => {
                const aberta = abertaIndex === idx;
                return (
                  <div
                    key={item.pergunta}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setAbertaIndex(aberta ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 p-6 text-left transition hover:bg-gray-50/70"
                    >
                      <span className="text-base font-semibold text-[#0A2540]">
                        {item.pergunta}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-[#1565C0] transition-transform ${
                          aberta ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {aberta && (
                      <div className="border-t border-gray-100 px-6 pb-6 pt-4 text-sm leading-relaxed text-gray-600">
                        {item.resposta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <ShieldCheck size={22} />
                </div>
                <h2 className="mt-4 text-lg font-bold text-[#0A2540]">
                  Perfis e Governança
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <Users
                      size={16}
                      className="mt-0.5 shrink-0 text-[#26A69A]"
                    />
                    <span>
                      <strong>Administradores:</strong> gerenciam a clínica,
                      equipe, pacientes e vínculos de cuidado.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Stethoscope
                      size={16}
                      className="mt-0.5 shrink-0 text-[#1565C0]"
                    />
                    <span>
                      <strong>Equipe Clínica:</strong> acompanha telemetria,
                      prescreve medicamentos e gerencia consultas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Smartphone
                      size={16}
                      className="mt-0.5 shrink-0 text-[#26A69A]"
                    />
                    <span>
                      <strong>Idosos e Familiares:</strong> integração entre o
                      app móvel do paciente e o painel remoto da família.
                    </span>
                  </li>
                </ul>

                <Link
                  href="/contato"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A2540]"
                >
                  Falar com o Suporte
                  <ArrowRight size={16} />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}