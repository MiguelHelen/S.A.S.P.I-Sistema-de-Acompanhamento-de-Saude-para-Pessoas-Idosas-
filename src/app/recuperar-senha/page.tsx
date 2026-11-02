"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const emailLower = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailLower, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setEnviado(true);
    } catch (err: any) {
      // Como medida de segurança, o Supabase já omite o erro se o e-mail não existir (se configurado assim no Auth). 
      // Mas garantimos aqui o feedback genérico caso algo falhe.
      setErro("Houve um problema ao processar a solicitação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB] px-4 py-8 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-blue-950/5 sm:p-12">
          
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]">
            <ArrowLeft size={17} />
            Voltar para Login
          </Link>

          <div className="mt-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F1FB] text-[#1565C0]">
              <ShieldCheck size={28} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#0A2540]">
              Recuperação de Acesso
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Informe o e-mail cadastrado na clínica. Se ele constar em nossa base, enviaremos as instruções de redefinição de senha.
            </p>
          </div>

          {enviado ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
              <h2 className="mt-4 font-semibold text-emerald-800">E-mail de recuperação enviado!</h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-700">
                Verifique sua caixa de entrada (e a pasta de spam) de <strong>{email}</strong> para criar uma nova senha. O link expira em 24 horas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRecover} className="mt-8 space-y-5">
              {erro && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                  <AlertCircle size={20} className="shrink-0 text-red-600" />
                  <p className="text-sm font-medium">{erro}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#0A2540]">E-mail Corporativo ou Pessoal</label>
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

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3.5 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Enviar link de recuperação"}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}