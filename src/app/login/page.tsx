import Link from "next/link";
import { ArrowLeft, HeartPulse, KeyRound, Mail } from "lucide-react";

export default function Login() {
  return (
    <main className="min-h-screen bg-[#F2F7FB] px-4 py-8 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-blue-950/5 lg:grid-cols-2">
          {/* Área institucional */}
          <section className="relative hidden overflow-hidden bg-[#0A2540] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center">
                <img
                  src="/logo.png"
                  alt="S.A.S.P.I."
                  className="h-12 w-auto brightness-0 invert"
                />
              </Link>

              <div className="mt-16">
                <span className="text-sm font-semibold uppercase tracking-wider text-[#67D5CA]">
                  Saúde e tecnologia
                </span>

                <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight">
                  Cuidado mais conectado e organizado.
                </h1>

                <p className="mt-5 max-w-md leading-relaxed text-blue-100">
                  Acompanhe informações importantes da saúde de forma simples,
                  segura e acessível.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <HeartPulse size={20} />
              </div>

              <p>Informações de saúde centralizadas em um único ambiente.</p>
            </div>
          </section>

          {/* Área do formulário */}
          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
              >
                <ArrowLeft size={17} />
                Voltar para o início
              </Link>

              <div className="mt-10">
                <img
                  src="/logo.png"
                  alt="S.A.S.P.I."
                  className="mb-8 h-11 w-auto lg:hidden"
                />

                <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
                  Bem-vindo de volta
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A2540]">
                  Acesse sua conta
                </h2>

                <p className="mt-3 text-gray-600">
                  Entre com seus dados para acessar o S.A.S.P.I.
                </p>
              </div>

              <form className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    E-mail
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="email"
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="senha"
                      className="text-sm font-medium text-[#0A2540]"
                    >
                      Senha
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-[#1565C0] hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="senha"
                      type="password"
                      placeholder="Digite sua senha"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl bg-[#1565C0] px-5 py-3.5 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
                >
                  Entrar
                </button>
              </form>

              <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                <p className="text-sm text-gray-600">
                  Ainda não possui uma conta?{" "}
                  <Link
                    href="/cadastro"
                    className="font-semibold text-[#1565C0] hover:underline"
                  >
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
