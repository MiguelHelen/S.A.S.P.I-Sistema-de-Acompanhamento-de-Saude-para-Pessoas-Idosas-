"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_URL, limparSessao } from "@/lib/clinica";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

function traduzirErroRecuperacao(mensagem?: string): string {
  const msg = String(mensagem || "").toLowerCase();

  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("429")
  ) {
    return "O limite de envio de e-mails do servidor de autenticação foi atingido temporariamente (máximo de 2 envios por hora no plano gratuito). Aguarde alguns minutos antes de solicitar novamente.";
  }

  if (
    msg.includes("invalid email") ||
    msg.includes("unable to validate email")
  ) {
    return "Informe um endereço de e-mail institucional válido.";
  }

  return "Não foi possível enviar o link de redefinição de senha no momento. Tente novamente em instantes.";
}

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function irParaLogin() {
    limparSessao();
    router.push("/login");
  }

  async function verificarEmailExisteNoSistema(
    emailBusca: string,
  ): Promise<boolean | null> {
    try {
      const res = await fetch(`${API_URL}/usuario`);
      if (!res.ok) return null;
      const raw = await res.json();
      const lista = Array.isArray(raw) ? raw : raw?.data || [];
      if (!Array.isArray(lista)) return null;
      return lista.some(
        (u: any) =>
          String(u.email || "")
            .trim()
            .toLowerCase() === emailBusca,
      );
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown > 0) return;

    setEnviando(true);
    setErro("");
    setSucesso(false);

    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo) {
      setErro("Informe o e-mail institucional cadastrado.");
      setEnviando(false);
      return;
    }

    try {
      const existe = await verificarEmailExisteNoSistema(emailLimpo);
      if (existe === false) {
        setErro(
          "Este e-mail não está cadastrado no S.A.S.P.I. Verifique o endereço digitado ou solicite o cadastro ao administrador da clínica.",
        );
        setEnviando(false);
        return;
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "";

      const redirectTo = origin ? `${origin}/redefinir-senha` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
        ...(redirectTo ? { redirectTo } : {}),
      });

      if (error) {
        throw new Error(traduzirErroRecuperacao(error.message));
      }

      setSucesso(true);
      setCooldown(60);
    } catch (err: any) {
      setErro(
        err?.message ||
          "Não foi possível enviar o link de redefinição de senha no momento.",
      );
      setCooldown(30);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <button
          type="button"
          onClick={irParaLogin}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={16} />
          Voltar para o login
        </button>

        <div className="mt-6 flex items-center gap-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white p-2.5 shadow-xs">
            <Image
              src="/logosemtexto.png"
              alt="S.A.S.P.I."
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A2540]">
              Recuperar Senha
            </h1>
            <p className="text-xs text-gray-500">
              Redefinição segura de acesso ao S.A.S.P.I.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          Digite o e-mail vinculado à sua conta institucional. Enviaremos um
          link seguro para cadastrar uma nova senha.
        </p>

        {erro && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <span>{erro}</span>
          </div>
        )}

        {sucesso ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <div className="flex items-center gap-2.5 font-semibold">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <span>E-mail de recuperação enviado!</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-emerald-800">
              Verifique a caixa de entrada (e a pasta de spam) de{" "}
              <strong>{email}</strong> e siga as instruções para criar sua nova
              senha.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={irParaLogin}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A2540]"
              >
                Retornar ao Login
              </button>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={() => setSucesso(false)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cooldown > 0 ? (
                  <>
                    <Clock size={14} />
                    Aguarde {cooldown}s para reenviar
                  </>
                ) : (
                  "Enviar para outro e-mail ou reenviar"
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                E-mail cadastrado
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@clinica.com.br"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando || cooldown > 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A2540] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {enviando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando instruções...
                </>
              ) : cooldown > 0 ? (
                <>
                  <Clock size={17} />
                  Aguarde {cooldown}s para tentar novamente
                </>
              ) : (
                "Enviar Link de Redefinição"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
