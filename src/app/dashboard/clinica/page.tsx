"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  isAdminPerfil,
  salvarUsuarioSessao,
  validarEObterClinicaId,
} from "@/lib/clinica";
import {
  Building2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  MapPin,
  Phone,
  FileText,
} from "lucide-react";

interface DadosClinica {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  endereco?: string;
}

export default function ClinicaPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [clinicaId, setClinicaId] = useState("");
  const [formData, setFormData] = useState<DadosClinica>({
    id: "",
    nome: "",
    cnpj: "",
    telefone: "",
    endereco: "",
  });

  useEffect(() => {
    async function carregarClinica() {
      const usuario = getUsuarioSessao();
      if (!usuario || !isAdminPerfil(usuario.perfil)) {
        setAutorizado(false);
        setCarregando(false);
        return;
      }

      setAutorizado(true);

      try {
        const idClinica = validarEObterClinicaId(usuario);
        setClinicaId(idClinica);

        const res = await fetch(`${API_URL}/clinica/${idClinica}`, {
          headers: getAuthHeaders(false),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.message ||
              "Não foi possível carregar os dados cadastrais da clínica."
          );
        }

        const raw = await res.json();
        const dados = raw?.data || raw;

        setFormData({
          id: String(dados.id || idClinica),
          nome: String(dados.nome || usuario.clinica_nome || ""),
          cnpj: String(dados.cnpj || ""),
          telefone: String(dados.telefone || ""),
          endereco: String(dados.endereco || ""),
        });
      } catch (err: any) {
        setErro(err.message || "Falha ao carregar informações da clínica.");
      } finally {
        setCarregando(false);
      }
    }

    carregarClinica();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");

    if (!clinicaId) {
      setErro("Identificador da clínica não localizado na sessão.");
      setSalvando(false);
      return;
    }

    const nomeLimpo = formData.nome.trim();
    if (!nomeLimpo) {
      setErro("O nome da clínica é obrigatório.");
      setSalvando(false);
      return;
    }

    try {
      const payload = {
        nome: nomeLimpo,
        cnpj: formData.cnpj?.trim() || undefined,
        telefone: formData.telefone?.trim() || undefined,
        endereco: formData.endereco?.trim() || undefined,
      };

      const res = await fetch(`${API_URL}/clinica/${clinicaId}`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(
          msg || "Não foi possível atualizar os dados da clínica."
        );
      }

      salvarUsuarioSessao({
        clinica_id: clinicaId,
        clinica_nome: nomeLimpo,
      });

      setMensagem("Dados da clínica atualizados com sucesso!");
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao salvar dados da clínica.");
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
            Apenas Administradores podem visualizar e editar os dados da
            instituição.
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
            Administração Institucional
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Dados da Clínica
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie a identificação oficial e os canais de contato da unidade
            vinculada à sua conta.
          </p>
        </div>

        {mensagem && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{mensagem}</p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        {carregando ? (
          <div className="mt-10 flex items-center justify-center py-12 text-gray-500">
            <Loader2 size={24} className="animate-spin text-[#1565C0]" />
            <span className="ml-2 text-sm">
              Carregando informações da clínica...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0A2540]">
                    Identificação da Unidade
                  </h2>
                  <p className="text-xs text-gray-500">
                    ID institucional: {clinicaId}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Nome da Clínica / Instituição *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex.: Clínica Geriátrica Vida Plena"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    CNPJ
                  </label>
                  <div className="relative">
                    <FileText
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.cnpj || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, cnpj: e.target.value })
                      }
                      placeholder="00.000.000/0001-00"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Telefone Institucional
                  </label>
                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.telefone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                      placeholder="(11) 3333-4444"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Endereço Completo
                  </label>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.endereco || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, endereco: e.target.value })
                      }
                      placeholder="Rua, número, bairro, cidade - UF"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={salvando || !clinicaId}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540] disabled:opacity-70"
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
        )}
      </div>
    </main>
  );
}