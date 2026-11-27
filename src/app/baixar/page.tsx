import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  Smartphone,
  Watch,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Baixar Aplicativo Android | S.A.S.P.I.",
  description: "Instalação oficial do aplicativo móvel S.A.S.P.I. para Android.",
  robots: {
    index: false,
    follow: false,
  },
};

// Substitua pelo link do GitHub Releases ou mantenha "/saspi.apk" se colocar na pasta public/
const APK_DOWNLOAD_URL = "/saspi.apk";

export default function BaixarAppPage() {
  return (
    <main className="min-h-screen bg-[#F2F7FB] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Ir para o portal institucional
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-blue-950/5">
          {/* Cabeçalho */}
          <div className="bg-[#0A2540] px-8 py-10 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md">
              <Image
                src="/logosemtexto.png"
                alt="S.A.S.P.I."
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            </div>

            <span className="mt-4 inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#5EEAD4] uppercase">
              Versão Mobile • Android 8.0+
            </span>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Aplicativo S.A.S.P.I.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-blue-100/80">
              Acompanhamento de rotina, medicações, agenda clínica e sinais
              vitais integrados ao Health Connect.
            </p>

            <div className="mt-7">
              <a
                href={APK_DOWNLOAD_URL}
                download="SASPI-Mobile-v1.0.0.apk"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1565C0] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-[#1976D2]"
              >
                <Download size={19} />
                Baixar APK para Android (v1.0.0)
              </a>
            </div>
          </div>

          {/* Instruções de instalação */}
          <div className="p-8 sm:p-10">
            <h2 className="text-base font-semibold text-[#0A2540]">
              Como instalar no seu celular
            </h2>

            <ol className="mt-4 space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F1FB] text-xs font-bold text-[#1565C0]">
                  1
                </span>
                <span>
                  Toque no botão <strong>Baixar APK para Android</strong> acima e
                  aguarde o download concluir.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F1FB] text-xs font-bold text-[#1565C0]">
                  2
                </span>
                <span>
                  Abra o arquivo baixado na barra de notificações. Se o Android
                  solicitar permissão, toque em{" "}
                  <strong>Configurações &gt; Permitir desta fonte</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F1FB] text-xs font-bold text-[#1565C0]">
                  3
                </span>
                <span>
                  Confirme em <strong>Instalar</strong> e entre com suas
                  credenciais de <strong>Familiar</strong> ou{" "}
                  <strong>Cuidador</strong>.
                </span>
              </li>
            </ol>

            {/* Recursos incluídos */}
            <div className="mt-8 grid gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 text-xs font-medium text-gray-600">
                <Smartphone size={17} className="shrink-0 text-[#1565C0]" />
                <span>Acesso para Família e Cuidadores</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-gray-600">
                <Watch size={17} className="shrink-0 text-[#26A69A]" />
                <span>Sincronização Health Connect</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-gray-600">
                <ShieldCheck size={17} className="shrink-0 text-[#1565C0]" />
                <span>Dados protegidos (LGPD)</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50/80 px-4 py-3 text-xs text-emerald-800">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>
                Build oficial de demonstração acadêmica — conectado à API em
                nuvem.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}