"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RedefinirSenha() {
  const router = useRouter();
  
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  
  // O Supabase Auth intercepta o token na URL e loga o usuário automaticamente se o link for válido.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("error_description")) {
      const params = new URLSearchParams(hash.substring(1));
      const errMsg = params.get("error_description");
      if (errMsg) setErro("Link inválido ou expirado. Por favor, solicite um novo e-mail de recuperação.");
    }
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    
    if (senha !== confirmarSenha) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha
      });

      if (error) {
        throw new Error(error.message);
      }

      setSucesso(true);
      // Remove a sessão do usuário temporário para obrigá-lo a fazer login com a nova senha
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err: any) {
      setErro(err.message || "Erro ao atualizar a senha. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB] px-4 py-8 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-blue-950/5 sm:p-12">
          
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F1FB] text-[#1565C0]">
              <Lock size={28} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#0A2540]">
              Criar Nova Senha
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Quase lá! Insira abaixo a sua nova senha de acesso à instituição.
            </p>
          </div>

          {sucesso ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
              <h2 className="mt-4 font-semibold text-emerald-800">Senha atualizada com sucesso!</h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-700">
                Você será redirecionado para a tela de login em instantes.
              </p>
              <Link href="/login" className="mt-4 inline-block text-sm font-medium text-[#1565C0] hover:underline">
                Ir para o Login agora
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="mt-8 space-y-5">
              {erro && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                  <AlertCircle size={20} className="shrink-0 text-red-600" />
                  <p className="text-sm font-medium">{erro}</p>
                </div>
              )}

              <div>
                <label htmlFor="novaSenha" className="mb-2 block text-sm font-medium text-[#0A2540]">Nova Senha</label>
                <div className="relative">
                  <Lock size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="novaSenha"
                    type={mostrarSenha ? "text" : "password"}
                    required
                    minLength={6}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A2540] transition"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmaSenha" className="mb-2 block text-sm font-medium text-[#0A2540]">Confirme a Nova Senha</label>
                <div className="relative">
                  <Lock size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmaSenha"
                    type={mostrarSenha ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3.5 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Redefinir e Acessar"}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}