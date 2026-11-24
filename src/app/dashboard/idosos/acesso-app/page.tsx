"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { calcularIdadeReal } from "@/components/PatientSelector";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  isAdminPerfil,
  validarEObterClinicaId,
} from "@/lib/clinica";
import {
  ArrowLeft,
  Smartphone,
  KeyRound,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

interface IdosoOpcao {
  id: string;
  nome: string;
  idade: number;
}

function gerarSenhaSegura(tamanho = 10): string {
  const caracteres =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
  const array = new Uint32Array(tamanho);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < tamanho; i++) {
      array[i] = Math.floor(Math.random() * caracteres.length);
    }
  }
  return Array.from(array, (val) => caracteres[val % caracteres.length]).join(
    ""
  );
}

export default function AcessoAppIdosoPage() {
  const searchParams = useSearchParams();
  const idosoParam = searchParams.get("idoso_id") || "";

  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  const [idosos, setIdosos] = useState<IdosoOpcao[]>([]);
  const [idosoId, setIdosoId] = useState(idosoParam);
  const [emailApp, setEmailApp] = useState("");
  const [senhaApp, setSenhaApp] = useState("");

  useEffect(() => {
    setSenhaApp(gerarSenhaSegura(10));
  }, []);

  useEffect(() => {
    async function carregarIdosos() {
      const sessao = getUsuarioSessao();
      if (!sessao || !isAdminPerfil(sessao.perfil)) {
        setAutorizado(false);
        setCarregando(false);
        return;
      }

      setAutorizado(true);

      try {
        const clinicaId = validarEObterClinicaId(sessao);

        const res = await fetch(`${API_URL}/idoso?clinica_id=${clinicaId}`, {
          headers: getAuthHeaders(false),
        });

        if (!res.ok) {
          throw new Error("Não foi possível carregar os pacientes da clínica.");
        }

        const raw = await res.json();
        const lista = Array.isArray(raw) ? raw : raw?.data || [];

        const opcoes: IdosoOpcao[] = lista
          .filter((i: any) => !i.clinica_id || i.clinica_id === clinicaId)
          .map((i: any) => {
            const idadeReal = calcularIdadeReal(i.data_nascimento);
            return {
              id: String(i.id),
              nome: String(i.nome || ""),
              idade: idadeReal > 0 ? idadeReal : Number(i.idade || 0),
            };
          });

        setIdosos(opcoes);

        if (idosoParam && opcoes.some((o) => o.id === idosoParam)) {
          setIdosoId(idosoParam);
        } else if (opcoes.length > 0 && !idosoId) {
          setIdosoId(opcoes[0].id);
        }
      } catch (err: any) {
        setErro(err.message || "Falha ao carregar pacientes.");
      } finally {
        setCarregando(false);
      }
    }

    carregarIdosos();
  }, [idosoParam]);

  function handleCopiarCredenciais() {
    const paciente = idosos.find((i) => i.id === idosoId);
    const texto = `Acesso App S.A.S.P.I.\nPaciente: ${paciente?.nome || ""}\nE-mail: ${emailApp}\nSenha: ${senhaApp}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    if (!idosoId) {
      setErro("Selecione um paciente.");
      setSalvando(false);
      return;
    }

    const emailLimpo = emailApp.trim().toLowerCase();
    if (!emailLimpo) {
      setErro("Informe o e-mail de acesso para o aplicativo.");
      setSalvando(false);
      return;
    }

    if (senhaApp.length < 6) {
      setErro("A senha do aplicativo deve ter no mínimo 6 caracteres.");
      setSalvando(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/idoso/${idosoId}/acesso-app`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          email: emailLimpo,
          senha: senhaApp,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(
          msg || "Não foi possível configurar as credenciais do aplicativo."
        );
      }

      setSucesso(true);
    } catch (err: any) {
      setErro(err.message || "Erro ao salvar credencial do aplicativo.");
    } finally {
      setSalvando(false);
    }
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
            Apenas Administradores podem criar ou redefinir credenciais do
            aplicativo móvel do idoso.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/idosos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para pacientes
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Aplicativo Móvel do Paciente
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Acesso App do Idoso
          </h1>
          <p className="mt-2 text-gray-600">
            Configure o e-mail e a senha exclusivos para que o paciente entre no
            aplicativo móvel S.A.S.P.I.
          </p>
        </div>

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        {sucesso && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <span>Credencial do aplicativo configurada com sucesso!</span>
              </div>

              <button
                type="button"
                onClick={handleCopiarCredenciais}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
              >
                {copiado ? <Check size={14} /> : <Copy size={14} />}
                {copiado ? "Credenciais Copiadas" : "Copiar Dados de Acesso"}
              </button>
            </div>
            <p className="mt-2 text-xs text-emerald-800">
              Compartilhe este e-mail e senha apenas com o paciente ou seu
              responsável direto para login no app móvel.
            </p>
          </div>
        )}

        {carregando ? (
          <div className="mt-10 flex items-center justify-center py-12 text-gray-500">
            <Loader2 size={24} className="animate-spin text-[#1565C0]" />
            <span className="ml-2 text-sm">Carregando pacientes...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Smartphone size={22} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0A2540]">
                    Credenciais do Aplicativo
                  </h2>
                  <p className="text-xs text-gray-500">
                    Este acesso é exclusivo para o app móvel e não libera entrada
                    no painel web administrativo.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Paciente (Idoso) *
                  </label>
                  <select
                    required
                    value={idosoId}
                    onChange={(e) => setIdosoId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="">Selecione o paciente...</option>
                    {idosos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome}
                        {i.idade > 0 ? ` (${i.idade} anos)` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    E-mail de login no App *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailApp}
                    onChange={(e) => setEmailApp(e.target.value)}
                    placeholder="paciente@exemplo.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Senha do App *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={senhaApp}
                        onChange={(e) => setSenhaApp(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 font-mono text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSenhaApp(gerarSenhaSegura(10))}
                      title="Gerar nova senha segura"
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-[#FAFCFE] px-3.5 text-gray-600 transition hover:border-[#1565C0] hover:text-[#1565C0]"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/idosos"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={salvando || idosos.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm hover:bg-[#0A2540] disabled:opacity-70"
              >
                {salvando ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {salvando ? "Salvando..." : "Salvar Credencial do App"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}