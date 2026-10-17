"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function CadastroRestrito() {
  return (
    <main className="min-h-screen bg-[#F2F7FB] px-4 py-8 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-blue-950/5 md:p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <ShieldAlert size={36} />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#0A2540] md:text-3xl">
            Acesso Restrito
          </h1>

          <p className="mt-4 max-w-lg mx-auto text-sm leading-relaxed text-gray-600 md:text-base">
            O cadastro de novos usuários é gerenciado exclusivamente pela administração da instituição dentro do Dashboard. Entre em contato com a equipe de TI da sua clínica.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <ArrowLeft size={16} />
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}