"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Phone,
  IdCard,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

const CLINICA_PADRAO_ID = "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

export default function NovoUsuario() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [autorizado, setAutorizado] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    cpf: "",
    perfil: "CUIDADOR",
    clinica_id: CLINICA_PADRAO_ID,
  });

  useEffect(() => {
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        const userData = parsed.user || parsed.usuario || parsed;
        const perfil = (userData.perfil || userData.role || "").toUpperCase();

        if (perfil !== "ADMINISTRADOR" && perfil !== "ADMIN") {
          setAutorizado(false);
          return;
        }

        setAutorizado(true);
        const cId =
          userData.clinica_id ||
          userData.clinicaId ||
          userData.clinica?.id ||
          CLINICA_PADRAO_ID;

        setFormData((prev) => ({ ...prev, clinica_id: cId }));
      } catch {
        setAutorizado(false);
      }
    } else {
      setAutorizado(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    const token = localStorage.getItem("saspi_token");

    const emailFormatado = formData.email.trim().toLowerCase();
    const telefoneLimpo = formData.telefone.replace(/\D/g, "");
    const cpfLimpo = formData.cpf.replace(/\D/g, "");

    const payload = {
      nome: formData.nome.trim(),
      email: emailFormatado,
      senha: formData.senha,
      telefone: telefoneLimpo.length > 0 ? telefoneLimpo : undefined,
      cpf: cpfLimpo.length > 0 ? cpfLimpo : undefined,
      perfil: String(formData.perfil || "CUIDADOR").trim().toUpperCase(),
      clinica_id: formData.clinica_id || CLINICA_PADRAO_ID,
    };

    try {
      // 1. Checagem preventiva para identificar se a colisão é de E-mail ou de CPF
      const resExistentes = await fetch(`${API_URL}/usuario`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      }).catch(() => null);

      if (resExistentes?.ok) {
        const listaUsuarios = await resExistentes.json();
        if (Array.isArray(listaUsuarios)) {
          const emailDuplicado = listaUsuarios.some(
            (u: any) => String(u.email || "").toLowerCase() === emailFormatado
          );
          if (emailDuplicado) {
            throw new Error(
              "Erro: Este e-mail já está cadastrado no sistema!"
            );
          }

          if (cpfLimpo.length > 0) {
            const cpfDuplicado = listaUsuarios.some(
              (u: any) =>
                String(u.cpf || "").replace(/\D/g, "") === cpfLimpo
            );
            if (cpfDuplicado) {
              throw new Error("Erro: Este CPF já está cadastrado no sistema!");
            }
          }
        }
      }

      // 2. Dispara o POST de criação
      const res = await fetch(`${API_URL}/usuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const errData = await res.json().catch(() => null);

      if (!res.ok) {
        let mensagemErro =
          errData?.message || "Erro desconhecido ao registrar usuário.";

        if (Array.isArray(errData?.message)) {
          mensagemErro = errData.message.join(", ");
        }

        const msgLower = String(mensagemErro).toLowerCase();

        // Como usuario.service.ts lança new Error() quando o e-mail já existe no Supabase Auth, o NestJS retorna 500
        if (
          res.status === 409 ||
          res.status === 500 ||
          msgLower.includes("p2002") ||
          msgLower.includes("unique") ||
          msgLower.includes("already") ||
          msgLower.includes("internal server error")
        ) {
          throw new Error("Erro: Este e-mail já está cadastrado no sistema!");
        }

        throw new Error(mensagemErro);
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao salvar usuário.");
    } finally {
      setSalvando(false);
    }
  }

  if (autorizado === null) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500">
          <Loader2 size={24} className="mx-auto animate-spin text-[#1565C0]" />
          <p className="mt-2 text-sm font-medium">
            Validando permissões de acesso...
          </p>
        </div>
      </main>
    );
  }

  if (autorizado === false) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldAlert size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#0A2540]">
            Acesso Restrito
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Apenas Administradores têm permissão para cadastrar novos membros ou
            profissionais na clínica.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <ArrowLeft size={16} />
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
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
            Gestão de Acessos
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Usuário
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Cadastre membros da rede de apoio ou profissionais clínicos
            vinculados a esta instituição.
          </p>
        </div>

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Usuário cadastrado com sucesso! Redirecionando...
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="mt-8 space-y-6"
        >
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <User size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Dados do Usuário
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados e defina a senha e o nível de permissão do
                  usuário.
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
                  <User
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
                  htmlFor="user_email"
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
                    id="user_email"
                    type="email"
                    required
                    autoComplete="off"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="usuario@exemplo.com"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="user_password"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Senha inicial (mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="user_password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={formData.senha}
                    onChange={(e) =>
                      setFormData({ ...formData, senha: e.target.value })
                    }
                    placeholder="••••••••"
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

              <div className="md:col-span-2">
                <label
                  htmlFor="perfil"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Perfil de Acesso *
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    id="perfil"
                    value={formData.perfil}
                    onChange={(e) =>
                      setFormData({ ...formData, perfil: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="MEDICO">
                      Médico (Acompanhamento clínico e prescrições)
                    </option>
                    <option value="ENFERMEIRO">
                      Enfermeiro (Triagem, rotinas e cuidados)
                    </option>
                    <option value="CUIDADOR">
                      Cuidador (Apoio na rotina diária)
                    </option>
                    <option value="FAMILIAR">
                      Familiar (Acompanhamento remoto)
                    </option>
                    <option value="ADMINISTRADOR">
                      Administrador (Gestão de usuários e clínica)
                    </option>
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
              {salvando ? "Cadastrando..." : "Cadastrar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}