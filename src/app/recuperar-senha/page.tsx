"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  HeartPulse,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "";

      const redirectTo = origin ? `${origin}/redefinir-senha` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
        ...(redirectTo ? { redirectTo } : {}),
      });

      if (error) {
        throw new Error(error.message);
      }

      setSucesso(true);
    } catch (err: any) {
      setErro(
        err.message ||
          "Não foi possível enviar o link de redefinição de senha no momento."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={16} />
          Voltar para o login
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1565C0] text-white">
            <HeartPulse size={22} />
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
            <Link
              href="/login"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A2540]"
            >
              Retornar ao Login
            </Link>
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
              disabled={enviando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A2540] disabled:opacity-70"
            >
              {enviando && <Loader2 size={18} className="animate-spin" />}
              {enviando ? "Enviando instruções..." : "Enviar Link de Redefinição"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}