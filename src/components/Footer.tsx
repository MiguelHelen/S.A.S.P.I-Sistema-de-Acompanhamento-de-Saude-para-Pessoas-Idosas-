import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white p-1.5 shadow-xs">
                <Image
                  src="/logosemtexto.png"
                  alt="S.A.S.P.I."
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="block text-lg font-bold text-[#0A2540]">
                  S.A.S.P.I.
                </span>
                <span className="block text-xs text-gray-500">
                  Sistema de Acompanhamento da Saúde da Pessoa Idosa
                </span>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-600">
              Plataforma institucional dedicada ao monitoramento contínuo de
              sinais vitais, controle de prescrições medicamentosas, agenda de
              consultas e integração segura entre equipes clínicas e familiares.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E8F1FB] px-3.5 py-2 text-xs font-medium text-[#1565C0]">
              <ShieldCheck size={15} />
              Ambiente protegido com controle de acesso por perfil e clínica
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0A2540]">
              Navegação
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
              <li>
                <Link href="/" className="transition hover:text-[#1565C0]">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="transition hover:text-[#1565C0]">
                  Sobre o Sistema
                </Link>
              </li>
              <li>
                <Link href="/ajuda" className="transition hover:text-[#1565C0]">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="transition hover:text-[#1565C0]"
                >
                  Contato Institucional
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0A2540]">
              Acesso e Conformidade
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
              <li>
                <Link href="/login" className="transition hover:text-[#1565C0]">
                  Entrar no Painel
                </Link>
              </li>
              <li>
                <Link
                  href="/recuperar-senha"
                  className="transition hover:text-[#1565C0]"
                >
                  Recuperar Senha
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="transition hover:text-[#1565C0]"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="transition hover:text-[#1565C0]"
                >
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>
            © {anoAtual} S.A.S.P.I. — Sistema de Acompanhamento da Saúde da
            Pessoa Idosa. Todos os direitos reservados.
          </p>
          <p>Plataforma de Gestão Clínica e Monitoramento Remoto</p>
        </div>
      </div>
    </footer>
  );
}
