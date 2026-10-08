"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  Mail,
  Phone,
  Save,
  UserRound,
  ShieldCheck,
  IdCard,
  KeyRound,
  Loader2,
  CheckCircle2,
  Users,
  AlertCircle,
} from "lucide-react";

export default function NovoUsuario() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroSessao, setErroSessao] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    senha: "",
    clinica_id: "",
    perfil: "CUIDADOR",
  });

  useEffect(() => {
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        // Resgata o UUID da clinica da sessao do administrador logado
        // Fallback para a Clinica Teste caso o endpoint de login ainda nao devolva o campo
        const cid =
          parsed.clinica_id ||
          parsed.clinicaId ||
          parsed.clinica?.id ||
          "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

        setFormData((prev) => ({ ...prev, clinica_id: cid }));
      } catch (err) {
        console.error("Erro ao ler dados da clinica na sessao:", err);
        setErroSessao("Nao foi possivel carregar a clinica do usuario logado.");
      }
    } else {
      // Fallback seguro de desenvolvimento para a clinica validada no Supabase
      setFormData((prev) => ({
        ...prev,
        clinica_id: "e63b19f5-d8e4-4973-bac6-12aba9a0545d",
      }));
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);

    if (!formData.clinica_id) {
      alert("Erro: ID da clinica nao identificado na sessao.");
      setSalvando(false);
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://perfect-bravery-production-5ce7.up.railway.app";
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("saspi_token")
        : null;

    // Normalizacao de CPF e Telefone (apenas digitos numericos)
    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ""),
      telefone: formData.telefone.replace(/\D/g, ""),
    };

    console.group(
      "%c🚀 S.A.S.P.I. -> Enviando Cadastro de Usuario",
      "color: #1565C0; font-weight: bold;",
    );
    console.log("📍 Destino:", `${apiUrl}/usuario`);
    console.log("📦 Dados (Payload):", payload);
    console.log("🔑 Token:", token ? "Presente" : "Ausente");
    console.groupEnd();

    try {
      const response = await fetch(`${apiUrl}/usuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);

      console.group(
        "%c📬 Resposta da API Railway",
        response.ok ? "color: #10b981;" : "color: #ef4444;",
      );
      console.log("Status HTTP:", response.status, response.statusText);
      console.log("Dados retornados:", responseData);
      console.groupEnd();

      if (!response.ok) {
        const errorMsg = Array.isArray(responseData?.message)
          ? responseData.message.join(", ")
          : responseData?.message || `Erro HTTP: ${response.status}`;
        throw new Error(errorMsg);
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error(
        "%c❌ Erro ao cadastrar usuario:",
        "color: #ef4444; font-weight: bold;",
        error,
      );
      alert(`Falha no cadastro: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para o Dashboard
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Gestao de Acessos
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Usuario
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Cadastre membros da rede de apoio ou profissionais clinicos vinculados
            a esta instituicao[cite: 7].
          </p>
        </div>

        {erroSessao && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
            <AlertCircle size={20} className="shrink-0 text-amber-600" />
            <p className="text-sm font-medium">{erroSessao}</p>
          </div>
        )}

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Usuario cadastrado com sucesso! Redirecionando...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Users size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Dados do Usuario
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados e defina a senha e o nivel de permissao do
                  usuario[cite: 7].
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="nome"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Nome completo *
                </label>
                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="nome"
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex.: Carlos de Almeida"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  E-mail *
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="usuario@clinica.com"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Senha inicial (minimo 6 caracteres) *
                </label>
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="senha"
                    type="password"
                    required
                    minLength={6}
                    value={formData.senha}
                    onChange={(e) =>
                      setFormData({ ...formData, senha: e.target.value })
                    }
                    placeholder="******"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="telefone"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Telefone
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    placeholder="(11) 90000-0000"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cpf"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  CPF
                </label>
                <div className="relative">
                  <IdCard
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value })
                    }
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="perfil"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Perfil de Acesso *[cite: 7]
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1565C0]"
                  />
                  <select
                    id="perfil"
                    required
                    value={formData.perfil}
                    onChange={(e) =>
                      setFormData({ ...formData, perfil: e.target.value })
                    }
                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#0A2540] outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="FAMILIAR">Familiar (Visualizacao)</option>
                    <option value="CUIDADOR">Cuidador (Apoio na rotina)</option>
                    <option value="ENFERMEIRO">
                      Enfermeiro (Registros clinicos)
                    </option>
                    <option value="MEDICO">Medico (Gestao clinica)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:opacity-70"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Cadastrando..." : "Cadastrar usuario"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}