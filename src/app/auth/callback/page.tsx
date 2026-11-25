"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  API_URL,
  limparSessao,
  resolverESalvarSessao,
} from "@/lib/clinica";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function processarCallbackSSO() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          if (ativo) {
            setErro(
              "Não foi possível obter a sessão de autenticação social. Tente novamente."
            );
          }
          return;
        }

        const providerBruto = (
          session.user?.app_metadata?.provider ||
          session.user?.identities?.[0]?.provider ||
          "GOOGLE"
        ).toUpperCase();

        const provedor: "GOOGLE" | "MICROSOFT" =
          providerBruto === "AZURE" || providerBruto === "MICROSOFT"
            ? "MICROSOFT"
            : "GOOGLE";

        const res = await fetch(`${API_URL}/auth/sso-callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: session.access_token,
            provedor,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          await supabase.auth.signOut();
          const mensagemErro = Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message ||
              "Acesso negado. Sua conta não possui pré-cadastro ativo na instituição.";

          if (ativo) {
            setErro(mensagemErro);
          }
          return;
        }

        const token = data.access_token;
        const usuario = data.usuario;

        if (!token || !usuario) {
          await supabase.auth.signOut();
          if (ativo) {
            setErro("Resposta inválida do servidor de autenticação.");
          }
          return;
        }

        const sessaoSalva = await resolverESalvarSessao({
          token,
          usuarioParcial: usuario,
          emailFallback: session.user?.email || usuario.email,
        });

        if (sessaoSalva.perfil === "IDOSO") {
          limparSessao();
          await supabase.auth.signOut();
          if (ativo) {
            setErro(
              "Esta conta é exclusiva para o Aplicativo Mobile S.A.S.P.I."
            );
          }
          return;
        }

        router.replace("/dashboard");
      } catch {
        if (ativo) {
          setErro(
            "Erro de conexão com o servidor durante a validação do acesso."
          );
        }
      }
    }

    processarCallbackSSO();

    return () => {
      ativo = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        {!erro ? (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0E7490] border-t-transparent" />
            <h1 className="text-xl font-bold text-[#0A2540]">
              Validando acesso institucional...
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Aguarde enquanto confirmamos suas credenciais no S.A.S.P.I.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-red-600">
              Falha na autenticação
            </h1>
            <p className="mt-2 text-sm text-gray-600">{erro}</p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="mt-6 w-full rounded-xl bg-[#0A2540] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#13385e]"
            >
              Voltar para o Login
            </button>
          </>
        )}
      </div>
    </main>
  );
}