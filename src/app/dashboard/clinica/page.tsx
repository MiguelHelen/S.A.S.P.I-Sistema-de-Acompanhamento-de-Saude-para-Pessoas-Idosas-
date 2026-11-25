"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  isAdminPerfil,
  salvarUsuarioSessao,
} from "@/lib/clinica";
import {
  Building2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export default function ClinicaPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [clinicaId, setClinicaId] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [cnpj, setCnpj] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [endereco, setEndereco] = useState<string>("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarClinica = useCallback(async () => {
    const sessao = getUsuarioSessao();
    if (!sessao || !isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      setCarregando(false);
      return;
    }

    setAutorizado(true);

    const idClinica = sessao.clinica_id;
    if (!idClinica) {
      setErro("Nenhuma clínica vinculada à sessão atual.");
      setCarregando(false);
      return;
    }

    setClinicaId(idClinica);
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch(`${API_URL}/clinica/${idClinica}`, {
        headers: getAuthHeaders(false),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível carregar os dados da clínica.";
        setErro(msg);
        return;
      }

      setNome(data?.nome || "");
      setCnpj(apenasDigitos(String(data?.cnpj || "")));
      setTelefone(apenasDigitos(String(data?.telefone || "")));
      setEndereco(data?.endereco || "");
    } catch {
      setErro("Erro de conexão ao buscar os dados da clínica.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarClinica();
  }, [carregarClinica]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!clinicaId) {
      setErro("Identificador da clínica não localizado.");
      return;
    }

    const cnpjLimpo = apenasDigitos(cnpj);
    const telefoneLimpo = apenasDigitos(telefone);

    if (!nome.trim()) {
      setErro("Informe a razão social ou nome da clínica.");
      return;
    }

    if (cnpjLimpo.length !== 14) {
      setErro("O CNPJ deve conter exatamente 14 dígitos numéricos.");
      return;
    }

    if (telefoneLimpo && (telefoneLimpo.length < 10 || telefoneLimpo.length > 11)) {
      setErro("O telefone deve conter 10 ou 11 dígitos numéricos com DDD.");
      return;
    }

    setSalvando(true);

    try {
      const res = await fetch(`${API_URL}/clinica/${clinicaId}`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          nome: nome.trim(),
          cnpj: cnpjLimpo,
          telefone: telefoneLimpo || undefined,
          endereco: endereco.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Não foi possível atualizar os dados da clínica.";
        setErro(msg);
        return;
      }

      salvarUsuarioSessao({ clinica_nome: nome.trim() });
      setSucesso(true);
    } catch {
      setErro("Erro de conexão ao salvar os dados da clínica.");
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
            Apenas Administradores podem consultar ou alterar os dados da
            clínica.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Gestão Institucional
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Dados da Clínica
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Consulte e atualize as informações cadastrais da instituição
            responsável pelo acompanhamento.
          </p>
        </div>

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Dados da clínica atualizados com sucesso!
            </p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Identificação da Instituição
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Mantenha o CNPJ e o contato institucional atualizados.
                </p>
              </div>
            </div>

            {carregando ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={18} className="animate-spin text-[#1565C0]" />
                Carregando dados da clínica...
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="nome_clinica"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Nome / Razão Social *
                  </label>
                  <input
                    id="nome_clinica"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cnpj_clinica"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    CNPJ (somente números) *
                  </label>
                  <input
                    id="cnpj_clinica"
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(apenasDigitos(e.target.value).slice(0, 14))}
                    placeholder="14 dígitos"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="telefone_clinica"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Telefone com DDD
                  </label>
                  <input
                    id="telefone_clinica"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    value={telefone}
                    onChange={(e) =>
                      setTelefone(apenasDigitos(e.target.value).slice(0, 11))
                    }
                    placeholder="10 ou 11 dígitos"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="endereco_clinica"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Endereço completo
                  </label>
                  <input
                    id="endereco_clinica"
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>
            )}
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={salvando || carregando || !clinicaId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}