"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  User,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
  Phone,
  IdCard,
  MapPin,
  ShieldAlert,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

const CLINICA_PADRAO_ID = "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

function calcularIdade(dataNasc: string): number {
  if (!dataNasc) return 70;
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mes = hoje.getMonth() - nasc.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade > 0 ? idade : 70;
}

export default function NovoIdoso() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [autorizado, setAutorizado] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    sexo: "Feminino",
    telefone: "",
    endereco: "",
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
        const cid =
          userData.clinica_id ||
          userData.clinicaId ||
          userData.clinica?.id ||
          CLINICA_PADRAO_ID;
        setFormData((prev) => ({ ...prev, clinica_id: cid }));
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

    const cpfLimpo = formData.cpf.replace(/\D/g, "");
    const telefoneLimpo = formData.telefone.replace(/\D/g, "");
    const enderecoLimpo = formData.endereco.trim();

    const payload = {
      nome: formData.nome.trim(),
      cpf: cpfLimpo.length > 0 ? cpfLimpo : undefined,
      data_nascimento: formData.data_nascimento,
      sexo: formData.sexo,
      telefone: telefoneLimpo.length > 0 ? telefoneLimpo : undefined,
      endereco: enderecoLimpo.length > 0 ? enderecoLimpo : undefined,
      clinica_id: formData.clinica_id || CLINICA_PADRAO_ID,
    };

    try {
      if (cpfLimpo.length > 0) {
        const resCheck = await fetch(
          `${API_URL}/idoso?clinica_id=${payload.clinica_id}`,
          {
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          }
        ).catch(() => null);

        if (resCheck?.ok) {
          const idososAtuais = await resCheck.json();
          if (Array.isArray(idososAtuais)) {
            const cpfJaExiste = idososAtuais.some(
              (i: any) => String(i.cpf || "").replace(/\D/g, "") === cpfLimpo
            );
            if (cpfJaExiste) {
              throw new Error(
                "Erro: Já existe um paciente cadastrado com este CPF no sistema!"
              );
            }
          }
        }
      }

      const response = await fetch(`${API_URL}/idoso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const errData = await response.json().catch(() => null);

      if (!response.ok) {
        const rawMsg = Array.isArray(errData?.message)
          ? errData.message.join(", ")
          : errData?.message || "";

        if (
          response.status === 409 ||
          response.status === 500 ||
          String(rawMsg).includes("P2002") ||
          String(rawMsg).toLowerCase().includes("unique")
        ) {
          throw new Error(
            "Erro: Já existe um paciente cadastrado com este CPF no sistema!"
          );
        }

        throw new Error(
          rawMsg ||
            `Erro ${response.status}: Falha ao registrar paciente no banco.`
        );
      }

      const idReal = errData?.id || String(Date.now());
      const novoIdoso = {
        id: idReal,
        nome: formData.nome.trim(),
        idade: calcularIdade(formData.data_nascimento),
        quarto: enderecoLimpo || "Leito padrão",
        sexo: formData.sexo,
        clinica_id: formData.clinica_id,
      };

      const listaAtualRaw = localStorage.getItem("saspi_elderly_list");
      let listaAtual: any[] = [];

      if (listaAtualRaw) {
        try {
          const parsed = JSON.parse(listaAtualRaw);
          if (Array.isArray(parsed)) listaAtual = parsed;
        } catch {}
      }

      const novaLista = [...listaAtual, novoIdoso];
      localStorage.setItem("saspi_elderly_list", JSON.stringify(novaLista));
      localStorage.setItem("saspi_active_elderly", JSON.stringify(novoIdoso));
      window.dispatchEvent(new Event("saspi_elderly_updated"));

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setErro(err.message || "Erro desconhecido ao conectar com a API.");
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
            Apenas Administradores têm permissão para admitir e cadastrar novos
            pacientes na instituição.
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
            Gestão de Pacientes
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Idoso
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Cadastre um novo paciente no sistema S.A.S.P.I. Os dados serão
            gravados diretamente na base de dados da clínica.
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
              Paciente cadastrado com sucesso! Redirecionando...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <HeartHandshake size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Dados Cadastrais do Paciente
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Preencha as informações conforme o prontuário de admissão.
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
                    placeholder="Ex.: Geraldo Magela da Costa"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cpf"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  CPF (opcional)
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
                  htmlFor="data_nascimento"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Data de nascimento *
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="data_nascimento"
                    type="date"
                    required
                    value={formData.data_nascimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data_nascimento: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sexo"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Sexo *
                </label>
                <select
                  id="sexo"
                  value={formData.sexo}
                  onChange={(e) =>
                    setFormData({ ...formData, sexo: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="telefone"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Telefone / Contato do Responsável
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
                    placeholder="(11) 98888-7777"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="endereco"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Endereço / Quarto / Observações
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
                    placeholder="Ex.: Quarto 104 - Bloco B. Hipertenso, acompanhado pela filha."
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
              {salvando ? "Gravando no banco..." : "Cadastrar Idoso"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}