"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  API_URL,
  limparSessao,
  resolverESalvarSessao,
} from "@/lib/clinica";
import { Loader2, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function processarRetornoGoogle() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          const retry = await supabase.auth.getSession();
          if (!retry.data.session?.user) {
            throw new Error(
              "Não foi possível confirmar sua identidade com o Google."
            );
          }
        }

        const finalSession =
          session || (await supabase.auth.getSession()).data.session;
        const userGoogle = finalSession?.user;

        if (!userGoogle?.email) {
          throw new Error("E-mail não fornecido pela conta Google.");
        }

        const res = await fetch(`${API_URL}/auth/sso-callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userGoogle.email,
            nome:
              userGoogle.user_metadata?.full_name ||
              userGoogle.user_metadata?.name ||
              userGoogle.email.split("@")[0],
            avatar_url: userGoogle.user_metadata?.avatar_url || null,
            provider_id: userGoogle.id,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            data?.message ||
              "Sua conta Google ainda não foi pré-cadastrada pelo administrador da clínica no S.A.S.P.I."
          );
        }

        const token = data?.access_token || data?.token;
        if (!token) {
          throw new Error("Token de acesso não retornado pelo servidor.");
        }

        const sessaoSalva = await resolverESalvarSessao({
          token,
          usuarioParcial: data?.usuario || data?.user || data,
          emailFallback: userGoogle.email,
        });

        if (sessaoSalva.perfil === "IDOSO") {
          limparSessao();
          await supabase.auth.signOut().catch(() => {});
          throw new Error(
            "Este painel é exclusivo para Administradores, Equipe Clínica e Familiares. Idosos devem utilizar o aplicativo móvel S.A.S.P.I."
          );
        }

        if (!sessaoSalva.clinica_id) {
          limparSessao();
          await supabase.auth.signOut().catch(() => {});
          throw new Error(
            "Seu usuário ainda não está vinculado a nenhuma clínica ativa. Solicite suporte ao administrador."
          );
        }

        if (ativo) {
          router.replace("/dashboard");
        }
      } catch (err: any) {
        if (ativo) {
          setErro(
            err.message ||
              "Falha ao concluir autenticação institucional com o Google."
          );
        }
      }
    }

    processarRetornoGoogle();

    return () => {
      ativo = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        {erro ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={28} />
            </div>
            <h1 className="mt-4 text-xl font-bold text-[#0A2540]">
              Acesso Não Autorizado
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{erro}</p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="mt-6 w-full rounded-xl bg-[#1565C0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A2540]"
            >
              Voltar para o Login
            </button>
          </>
        ) : (
          <>
            <Loader2
              size={34}
              className="mx-auto animate-spin text-[#1565C0]"
            />
            <h1 className="mt-4 text-xl font-bold text-[#0A2540]">
              Validando Acesso Institucional...
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Confirmando suas credenciais e vínculos clínicos no S.A.S.P.I.
            </p>
          </>
        )}
      </div>
    </main>
  );
}