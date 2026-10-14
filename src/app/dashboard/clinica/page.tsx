"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function ClinicaPage() {
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const [clinicaId, setClinicaId] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://perfect-bravery-production-5ce7.up.railway.app";

  useEffect(() => {
    async function carregarClinica() {
      setCarregando(true);
      const userRaw = localStorage.getItem("saspi_user");
      const token = localStorage.getItem("saspi_token");

      let cId = "e63b19f5-d8e4-4973-bac6-12aba9a0545d"; // Fallback da Clínica Teste

      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          const userData = parsed.user || parsed.usuario || parsed;
          cId = userData.clinica_id || userData.clinicaId || cId;
        } catch (e) {
          console.error(e);
        }
      }

      setClinicaId(cId);

      try {
        const res = await fetch(`${apiUrl}/clinica/${cId}`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });

        if (res.ok) {
          const data = await res.json();
          setFormData({
            nome: data.nome || "",
            cnpj: data.cnpj || "",
            telefone: data.telefone || "",
            email: data.email || "",
            endereco: data.endereco || "",
          });
        } else {
          // Preenchimento com dados padrão caso a rota retorne vazio
          setFormData((prev) => ({
            ...prev,
            nome: "Clinica Teste",
            email: "teste@saspi.com",
          }));
        }
      } catch (err) {
        console.warn("Aviso ao carregar dados da clínica:", err);
        setFormData((prev) => ({
          ...prev,
          nome: "Clinica Teste",
          email: "teste@saspi.com",
        }));
      } finally {
        setCarregando(false);
      }
    }

    carregarClinica();
  }, [apiUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    const token = localStorage.getItem("saspi_token");

    const payload = {
      nome: formData.nome.trim(),
      cnpj: formData.cnpj.replace(/\D/g, "") || null,
      telefone: formData.telefone.replace(/\D/g, "") || null,
      email: formData.email.trim() || null,
      endereco: formData.endereco.trim() || null,
    };

    try {
      const res = await fetch(`${apiUrl}/clinica/${clinicaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Tenta com PATCH se o backend usar PATCH
        const resPatch = await fetch(`${apiUrl}/clinica/${clinicaId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });

        if (!resPatch.ok) {
          const dataErr = await resPatch.json().catch(() => null);
          throw new Error(dataErr?.message || "Não foi possível atualizar a clínica.");
        }
      }

      // Atualiza o nome da clínica na sessão local para a Navbar reagir imediatamente
      const userRaw = localStorage.getItem("saspi_user");
      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          if (parsed.user) parsed.user.clinica_nome = payload.nome;
          else if (parsed.usuario) parsed.usuario.clinica_nome = payload.nome;
          else parsed.clinica_nome = payload.nome;

          localStorage.setItem("saspi_user", JSON.stringify(parsed));
          window.dispatchEvent(new Event("saspi_user_updated"));
        } catch {}
      }

      setSucesso(true);
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao salvar a clínica.");
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
            Gestão Institucional
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Dados da Clínica
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Atualize as informações cadastrais e de contato da sua instituição de saúde.
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
              Dados da clínica atualizados com sucesso!
            </p>
          </div>
        )}

        {carregando ? (
          <div className="mt-12 flex items-center justify-center py-12 text-gray-500">
            <Loader2 size={24} className="animate-spin text-[#1565C0]" />
            <span className="ml-2 text-sm">Carregando dados da clínica...</span>
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
                  <p className="mt-1 text-sm text-gray-500">
                    ID do Registro: <span className="font-mono text-xs">{clinicaId}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="nome"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Razão Social / Nome da Clínica *
                  </label>
                  <div className="relative">
                    <Building2
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
                      placeholder="Ex.: Clínica Bem Estar"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cnpj"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    CNPJ
                  </label>
                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="cnpj"
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) =>
                        setFormData({ ...formData, cnpj: e.target.value })
                      }
                      placeholder="00.000.000/0001-00"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="telefone"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Telefone Institucional
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
                      placeholder="(11) 3333-4444"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    E-mail de Contato
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="contato@clinica.com"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="endereco"
                    className="mb-2 block text-sm font-medium text-[#0A2540]"
                  >
                    Endereço Completo
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-3.5 text-gray-400"
                    />
                    <textarea
                      id="endereco"
                      rows={3}
                      value={formData.endereco}
                      onChange={(e) =>
                        setFormData({ ...formData, endereco: e.target.value })
                      }
                      placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                      className="w-full resize-none rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                    />
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
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}