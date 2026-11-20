"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function processarRetornoSSO() {
      try {
        const providerParam = (
          searchParams.get("provider") || "GOOGLE"
        ).toUpperCase() as "GOOGLE" | "MICROSOFT";

        // 1. Obtém a sessão autenticada pelo provedor OAuth no Supabase
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !sessionData.session?.access_token) {
          throw new Error(
            "Não foi possível validar a sessão externa. Tente entrar novamente."
          );
        }

        const supabaseToken = sessionData.session.access_token;

        // 2. Envia ao Backend NestJS para validar pré-cadastro institucional (Trava 403)
        const res = await fetch(`${API_URL}/auth/sso-callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: supabaseToken,
            provedor: providerParam === "MICROSOFT" ? "MICROSOFT" : "GOOGLE",
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          await supabase.auth.signOut().catch(() => null);
          throw new Error(
            data?.message ||
              "Acesso negado. Este e-mail não possui pré-cadastro ativo na instituição."
          );
        }

        const token = data.access_token || supabaseToken;
        const u = data.usuario || data.user || {};
        const emailFinal = (
          u.email ||
          sessionData.session.user?.email ||
          ""
        ).toLowerCase();

        const usuarioSalvar = {
          id: u.id || "",
          auth_id: sessionData.session.user?.id || "",
          nome: u.nome || emailFinal.split("@")[0] || "Usuário",
          email: emailFinal,
          perfil: String(u.perfil || "MEDICO").toUpperCase(),
          clinica_id: u.clinica_id || "e63b19f5-d8e4-4973-bac6-12aba9a0545d",
          clinica_nome: "Clínica - S.A.S.P.I.",
          foto_url: u.foto_url || null,
        };

        localStorage.removeItem("saspi_active_elderly");
        localStorage.removeItem("saspi_elderly_list");
        localStorage.setItem("saspi_token", token);
        localStorage.setItem("saspi_user", JSON.stringify(usuarioSalvar));

        document.cookie = `saspi_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `saspi_user=${encodeURIComponent(
          JSON.stringify(usuarioSalvar)
        )}; path=/; max-age=86400; SameSite=Lax`;

        window.dispatchEvent(new Event("saspi_user_updated"));

        if (ativo) {
          router.replace("/dashboard");
        }
      } catch (err: any) {
        if (ativo) {
          setErro(
            err.message ||
              "Falha ao autenticar com o provedor corporativo."
          );
        }
      }
    }

    processarRetornoSSO();
    return () => {
      ativo = false;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-blue-950/5">
        {erro ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={30} />
            </div>
            <h1 className="mt-5 text-xl font-bold text-[#0A2540]">
              Acesso não autorizado
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{erro}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0A2540]"
            >
              <ArrowLeft size={16} />
              Voltar para o Login
            </Link>
          </>
        ) : (
          <>
            <Loader2
              size={36}
              className="mx-auto animate-spin text-[#1565C0]"
            />
            <h1 className="mt-5 text-xl font-bold text-[#0A2540]">
              Validando credencial institucional...
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Verificando seu pré-cadastro e permissões de acesso no S.A.S.P.I.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB]">
          <Loader2 size={36} className="animate-spin text-[#1565C0]" />
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}