"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface Idoso {
  id: string;
  nome: string;
  cpf?: string;
  data_nascimento?: string;
  telefone?: string;
  clinica_id: string;
}

export default function CriarAcessoAppIdosoPage() {
  const router = useRouter();

  const [idososDisponiveis, setIdososDisponiveis] = useState<Idoso[]>([]);
  const [idosoSelecionadoId, setIdosoSelecionadoId] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://perfect-bravery-production-5ce7.up.railway.app";

  useEffect(() => {
    async function carregarIdosos() {
      try {
        const token = localStorage.getItem("saspi_token");
        const userRaw = localStorage.getItem("saspi_user");

        if (!token || !userRaw) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(userRaw);
        if (user?.perfil !== "ADMINISTRADOR") {
          router.push("/dashboard");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [resIdosos, resVinculos] = await Promise.all([
          fetch(`${apiUrl}/idoso`, { headers }),
          fetch(`${apiUrl}/usuario-idoso`, { headers }),
        ]);

        if (!resIdosos.ok) {
          throw new Error("Não foi possível carregar a lista de idosos.");
        }

        const listaIdosos: Idoso[] = await resIdosos.json();
        const listaVinculos = resVinculos.ok ? await resVinculos.json() : [];

        // Filtra idosos que já possuem vínculo como PROPRIO_IDOSO
        const idsComAcesso = new Set(
          (Array.isArray(listaVinculos) ? listaVinculos : [])
            .filter((v: any) => v.tipo_vinculo === "PROPRIO_IDOSO")
            .map((v: any) => v.idoso_id)
        );

        const filtrados = (Array.isArray(listaIdosos) ? listaIdosos : []).filter(
          (i) => !idsComAcesso.has(i.id)
        );

        setIdososDisponiveis(filtrados);
      } catch (err: any) {
        setErro(err.message || "Erro ao carregar dados.");
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarIdosos();
  }, [apiUrl, router]);

  const idosoAtual = idososDisponiveis.find((i) => i.id === idosoSelecionadoId);

  function gerarSenhaSugerida() {
    const num = Math.floor(1000 + Math.random() * 9000);
    setSenha(`saspi${num}`);
    setMostrarSenha(true);
  }

  function formatarData(dataIso?: string) {
    if (!dataIso) return "Não informada";
    const [ano, mes, dia] = dataIso.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!idosoSelecionadoId) {
      setErro("Selecione um idoso cadastrado.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setEnviando(true);

    try {
      const token = localStorage.getItem("saspi_token");
      const userRaw = localStorage.getItem("saspi_user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      const res = await fetch(`${apiUrl}/auth/criar-acesso-idoso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idoso_id: idosoSelecionadoId,
          email: email.trim().toLowerCase(),
          senha,
          clinica_id: user?.clinica_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Não foi possível criar o acesso mobile do idoso."
        );
      }

      setSucesso(
        `Acesso criado com sucesso! ${idosoAtual?.nome} já pode entrar no aplicativo mobile usando o e-mail ${email.trim().toLowerCase()} e a senha definida.`
      );

      // Remove o idoso recém-vinculado da lista de disponíveis
      setIdososDisponiveis((prev) =>
        prev.filter((i) => i.id !== idosoSelecionadoId)
      );
      setIdosoSelecionadoId("");
      setEmail("");
      setSenha("");
    } catch (err: any) {
      setErro(err.message || "Erro ao criar acesso.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/idosos"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={16} />
          Voltar para Idosos
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1565C0]">
            <Smartphone size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0A2540] md:text-2xl">
              Criar Acesso ao Aplicativo Mobile (Idoso)
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Selecione um idoso já cadastrado na clínica e defina o e-mail e a
              senha para ele acessar a rotina e medicamentos pelo celular.
            </p>
          </div>
        </div>

        {erro && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{sucesso}</span>
          </div>
        )}

        {carregandoDados ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="mr-2 animate-spin" size={20} />
            Carregando idosos cadastrados...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do Idoso */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A2540]">
                1. Selecione o Idoso Cadastrado *
              </label>
              <select
                value={idosoSelecionadoId}
                onChange={(e) => {
                  setIdosoSelecionadoId(e.target.value);
                  setErro("");
                  setSucesso("");
                }}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1565C0]"
              >
                <option value="">
                  {idososDisponiveis.length === 0
                    ? "Todos os idosos já possuem acesso mobile"
                    : "Escolha um idoso da lista..."}
                </option>
                {idososDisponiveis.map((idoso) => (
                  <option key={idoso.id} value={idoso.id}>
                    {idoso.nome} {idoso.cpf ? `— CPF: ${idoso.cpf}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Dados Puxados Automaticamente */}
            {idosoAtual && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
                  <UserCheck size={15} />
                  Dados Herdados do Cadastro
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-slate-500">Nome Completo:</span>
                    <p className="font-medium text-slate-800">
                      {idosoAtual.nome}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">CPF:</span>
                    <p className="font-medium text-slate-800">
                      {idosoAtual.cpf || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Data de Nascimento:</span>
                    <p className="font-medium text-slate-800">
                      {formatarData(idosoAtual.data_nascimento)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Telefone:</span>
                    <p className="font-medium text-slate-800">
                      {idosoAtual.telefone || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Credenciais de Acesso */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A2540]">
                  2. E-mail de Acesso ao App *
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="idoso@exemplo.com"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#0A2540]">
                    3. Senha de Acesso *
                  </label>
                  <button
                    type="button"
                    onClick={gerarSenhaSugerida}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#1565C0] hover:underline"
                  >
                    <Sparkles size={13} />
                    Gerar senha simples
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    minLength={6}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-[#1565C0]"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <Link
                href="/dashboard/idosos"
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={enviando || !idosoSelecionadoId}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A2540] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enviando && <Loader2 size={16} className="animate-spin" />}
                {enviando ? "Criando acesso..." : "Criar Acesso Mobile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}