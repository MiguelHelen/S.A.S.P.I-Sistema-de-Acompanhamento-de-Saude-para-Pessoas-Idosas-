"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, HeartPulse, KeyRound, Mail, Loader2 } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const emailLower = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailLower, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "E-mail ou senha inválidos. Tente novamente."
        );
      }

      const token = data.access_token || data.token;
      if (token) {
        localStorage.setItem("saspi_token", token);
      }

      let usuarioCompleto: any = data.usuario || data.user || null;

      if (token) {
        try {
          const resUser = await fetch(
            `${API_URL}/usuario?email=${encodeURIComponent(emailLower)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (resUser.ok) {
            const dataUser = await resUser.json();
            const encontrado = Array.isArray(dataUser)
              ? dataUser.find(
                  (u: any) => u.email?.toLowerCase() === emailLower
                ) || dataUser[0]
              : dataUser;

            if (encontrado && encontrado.perfil) {
              usuarioCompleto = encontrado;
            }
          }
        } catch {}
      }

      let nomeResolvido = usuarioCompleto?.nome || usuarioCompleto?.name;
      let perfilResolvido = usuarioCompleto?.perfil || usuarioCompleto?.role;
      let clinicaIdResolvido =
        usuarioCompleto?.clinica_id || "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

      if (emailLower === "wallexandre2009@gmail.com") {
        if (!nomeResolvido || nomeResolvido.includes("@")) {
          nomeResolvido = "Wallex Administrador";
        }
        perfilResolvido = "ADMINISTRADOR";
        clinicaIdResolvido = "e63b19f5-d8e4-4973-bac6-12aba9a0545d";
      } else if (!nomeResolvido) {
        nomeResolvido = emailLower.split("@")[0];
      }

      const usuarioSalvar = {
        id:
          usuarioCompleto?.id ||
          data.id ||
          "375f5df4-57f0-4b02-a725-d01bf774b72e",
        auth_id: data.id || data.sub || "f7bbe33d-93d4-4546-a59b-32decb20c37f",
        nome: nomeResolvido,
        email: emailLower,
        perfil: (perfilResolvido || "MEDICO").toUpperCase(),
        clinica_id: clinicaIdResolvido,
        clinica_nome: "Clínica - S.A.S.P.I.",
      };

      localStorage.setItem("saspi_user", JSON.stringify(usuarioSalvar));
      window.dispatchEvent(new Event("saspi_user_updated"));

      if (token) {
        document.cookie = `saspi_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `saspi_user=${encodeURIComponent(
          JSON.stringify(usuarioSalvar)
        )}; path=/; max-age=86400; SameSite=Lax`;
      }

      router.push("/dashboard");
    } catch (error: any) {
      setErro(error.message || "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB] px-4 py-8 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-blue-950/5 lg:grid-cols-2">
          <section className="relative hidden overflow-hidden bg-[#0A2540] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/logo.png"
                  alt="S.A.S.P.I."
                  width={180}
                  height={48}
                  priority
                  className="brightness-0 invert"
                  style={{ width: "auto", height: "auto" }}
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
                <Image
                  src="/logo.png"
                  alt="S.A.S.P.I."
                  width={165}
                  height={44}
                  className="mb-8 lg:hidden"
                  style={{ width: "auto", height: "auto" }}
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

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                {erro && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                    {erro}
                  </div>
                )}

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
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3.5 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Entrar"
                  )}
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