"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, HeartPulse, KeyRound, Mail, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSSO, setLoadingSSO] = useState<"GOOGLE" | "MICROSOFT" | null>(null);
  const [erro, setErro] = useState("");

  // Captura erros de callback do OAuth na URL, se houver
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("error_description")) {
      const params = new URLSearchParams(hash.substring(1));
      const errMsg = params.get("error_description");
      if (errMsg) setErro(decodeURIComponent(errMsg));
    }
  }, []);

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
        // Exibe exatamente a mensagem do backend (ex: Barreira 403 ou e-mail inválido)
        throw new Error(
          data.message || "E-mail ou senha inválidos. Tente novamente."
        );
      }

      await salvarSessaoERedirecionar(data, emailLower);
      
    } catch (error: any) {
      setErro(error.message || "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSSO(provedor: "GOOGLE" | "MICROSOFT") {
    setErro("");
    setLoadingSSO(provedor);

    try {
      const providerStr = provedor === "GOOGLE" ? "google" : "azure";
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerStr as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=${provedor}`,
        }
      });

      if (error) throw error;
      
    } catch (error: any) {
      setErro(`Falha ao conectar com ${provedor}: ${error.message}`);
      setLoadingSSO(null);
    }
  }

  async function salvarSessaoERedirecionar(data: any, emailUsado: string) {
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem("saspi_token", token);
    }

    let usuarioCompleto: any = data.usuario || data.user || null;

    if (token && !usuarioCompleto) {
      try {
        const resUser = await fetch(
          `${API_URL}/usuario?email=${encodeURIComponent(emailUsado)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resUser.ok) {
          const dataUser = await resUser.json();
          usuarioCompleto = Array.isArray(dataUser)
            ? dataUser.find((u: any) => u.email?.toLowerCase() === emailUsado) || dataUser[0]
            : dataUser;
        }
      } catch {}
    }

    const nomeResolvido = usuarioCompleto?.nome || usuarioCompleto?.name || emailUsado.split("@")[0];
    const perfilResolvido = usuarioCompleto?.perfil || usuarioCompleto?.role || "MEDICO";
    const clinicaIdResolvido = usuarioCompleto?.clinica_id || "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

    const usuarioSalvar = {
      id: usuarioCompleto?.id || data.id || "375f5df4-57f0-4b02-a725-d01bf774b72e",
      auth_id: usuarioCompleto?.auth_id || data.id || data.sub || "f7bbe33d-93d4-4546-a59b-32decb20c37f",
      nome: nomeResolvido,
      email: emailUsado,
      perfil: String(perfilResolvido).toUpperCase(),
      clinica_id: clinicaIdResolvido,
      clinica_nome: "Clínica - S.A.S.P.I.",
    };

    localStorage.removeItem("saspi_active_elderly");
    localStorage.removeItem("saspi_elderly_list");

    localStorage.setItem("saspi_user", JSON.stringify(usuarioSalvar));
    window.dispatchEvent(new Event("saspi_user_updated"));

    if (token) {
      document.cookie = `saspi_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `saspi_user=${encodeURIComponent(JSON.stringify(usuarioSalvar))}; path=/; max-age=86400; SameSite=Lax`;
    }

    router.push("/dashboard");
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
                  Acesso Institucional
                </span>
                <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight">
                  Cuidado mais conectado e seguro.
                </h1>
                <p className="mt-5 max-w-md leading-relaxed text-blue-100">
                  A plataforma S.A.S.P.I. é restrita a profissionais de saúde e rede de apoio previamente convidados pela administração da clínica.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <HeartPulse size={20} />
              </div>
              <p>O acesso unificado protege as informações clínicas.</p>
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]">
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
                <h2 className="text-3xl font-bold tracking-tight text-[#0A2540]">
                  Acesse sua conta
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Entre com suas credenciais ou utilize sua conta corporativa.
                </p>
              </div>

              {erro && (
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                  <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{erro}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#0A2540]">E-mail</label>
                  <div className="relative">
                    <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
                    <label htmlFor="senha" className="text-sm font-medium text-[#0A2540]">Senha</label>
                    <Link href="/recuperar-senha" className="text-xs font-medium text-[#1565C0] hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative">
                    <KeyRound size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
                  disabled={loading || loadingSSO !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3.5 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : "Entrar com Email e Senha"}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ou continuar com</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={loading || loadingSSO !== null}
                  onClick={() => handleSSO("GOOGLE")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-70"
                >
                  {loadingSSO === "GOOGLE" ? (
                    <Loader2 size={18} className="animate-spin text-gray-500" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Google
                </button>

                <button
                  type="button"
                  disabled={loading || loadingSSO !== null}
                  onClick={() => handleSSO("MICROSOFT")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-70"
                >
                  {loadingSSO === "MICROSOFT" ? (
                    <Loader2 size={18} className="animate-spin text-gray-500" />
                  ) : (
                    <svg viewBox="0 0 21 21" className="h-5 w-5" aria-hidden="true">
                      <path fill="#f25022" d="M1 1h9v9H1z" />
                      <path fill="#00a4ef" d="M1 11h9v9H1z" />
                      <path fill="#7fba00" d="M11 1h9v9h-9z" />
                      <path fill="#ffb900" d="M11 11h9v9h-9z" />
                    </svg>
                  )}
                  Microsoft
                </button>
              </div>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}