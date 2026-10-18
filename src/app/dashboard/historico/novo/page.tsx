"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import type { Idoso } from "@/components/PatientSelector";
import {
  ArrowLeft,
  HeartPulse,
  Save,
  Loader2,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function NovoRegistro() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [idoso, setIdoso] = useState<Idoso | null>(null);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [usuarioId, setUsuarioId] = useState<string>("");

  const [formData, setFormData] = useState({
    indicador_nome: "Frequência Cardíaca",
    valor: "",
    unidade: "bpm",
    observacao: "",
  });

  useEffect(() => {
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        const userData = parsed.user || parsed.usuario || parsed;
        const perfil = String(
          userData.perfil || userData.role || ""
        ).toUpperCase();

        setUsuarioId(userData.id || "");
        setAutorizado(perfil !== "FAMILIAR");
      } catch {
        setAutorizado(false);
      }
    } else {
      setAutorizado(false);
    }

    const activeElderly = localStorage.getItem("saspi_active_elderly");
    if (activeElderly) {
      try {
        setIdoso(JSON.parse(activeElderly));
      } catch {}
    }
  }, []);

  function handleIndicadorChange(nome_indicador: string) {
    let novaUnidade = "bpm";
    if (nome_indicador === "Oxigenação") novaUnidade = "%";
    if (nome_indicador === "Pressão Arterial") novaUnidade = "mmHg";
    if (nome_indicador === "Temperatura") novaUnidade = "°C";

    setFormData({
      ...formData,
      indicador_nome: nome_indicador,
      unidade: novaUnidade,
      valor: "",
    });
  }

  function handleValorChange(raw: string) {
    if (formData.indicador_nome === "Pressão Arterial") {
      // Permite exclusivamente números e uma barra '/' (Ex: 120/80)
      const apenasNumerosEBarra = raw
        .replace(/[^0-9/]/g, "")
        .replace(/(\/.*)\//g, "$1")
        .slice(0, 7);
      setFormData({ ...formData, valor: apenasNumerosEBarra });
      return;
    }

    if (formData.indicador_nome === "Temperatura") {
      const apenasDecimal = raw
        .replace(/[^0-9.,]/g, "")
        .replace(",", ".")
        .replace(/(\..*)\./g, "$1")
        .slice(0, 5);
      setFormData({ ...formData, valor: apenasDecimal });
      return;
    }

    // Frequência Cardíaca e Oxigenação: apenas dígitos inteiros positivos
    const apenasInteiros = raw.replace(/\D/g, "").slice(0, 3);
    setFormData({ ...formData, valor: apenasInteiros });
  }

  async function obterOuCriarIndicadorId(
    nomeIndicador: string,
    unidadePadrao: string,
    token: string | null
  ): Promise<string | null> {
    const headersAuth = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const resLista = await fetch(`${API_URL}/indicador-saude`, {
        headers: headersAuth,
      });
      if (resLista.ok) {
        const lista = await resLista.json();
        if (Array.isArray(lista)) {
          const existente = lista.find(
            (ind: any) =>
              String(ind.nome || "").toLowerCase() ===
              nomeIndicador.toLowerCase()
          );
          if (existente?.id) return existente.id;
        }
      }

      const resCriar = await fetch(`${API_URL}/indicador-saude`, {
        method: "POST",
        headers: headersAuth,
        body: JSON.stringify({
          nome: nomeIndicador,
          unidade_padrao: unidadePadrao,
        }),
      });

      if (resCriar.ok) {
        const criado = await resCriar.json();
        if (criado?.id) return criado.id;
      }
    } catch {}

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    if (!idoso || !idoso.id) {
      setErro("Nenhum paciente ativo selecionado.");
      setSalvando(false);
      return;
    }

    const token = localStorage.getItem("saspi_token");
    const valorLimpo = formData.valor.trim().replace(",", ".");
    const obsLimpa = formData.observacao.trim();

    if (formData.indicador_nome === "Pressão Arterial") {
      const matchPa = valorLimpo.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (!matchPa) {
        setErro(
          "Formato de Pressão Arterial inválido. Informe apenas números no formato Sistólica/Diastólica (Ex.: 120/80)."
        );
        setSalvando(false);
        return;
      }
      const sist = Number(matchPa[1]);
      const diast = Number(matchPa[2]);
      if (sist < 50 || sist > 300 || diast < 30 || diast > 200) {
        setErro(
          "Valores de Pressão Arterial fora dos limites fisiológicos válidos (Ex.: 120/80)."
        );
        setSalvando(false);
        return;
      }
    }

    const numeroConvertido = Number(valorLimpo);
    const isNumerico =
      formData.indicador_nome !== "Pressão Arterial" &&
      !Number.isNaN(numeroConvertido) &&
      valorLimpo !== "";

    if (formData.indicador_nome !== "Pressão Arterial" && !isNumerico) {
      setErro("O valor inserido é inválido. Digite apenas números.");
      setSalvando(false);
      return;
    }

    if (isNumerico) {
      if (
        formData.indicador_nome === "Frequência Cardíaca" &&
        (numeroConvertido < 20 || numeroConvertido > 250)
      ) {
        setErro(
          "A Frequência Cardíaca deve estar entre 20 e 250 bpm."
        );
        setSalvando(false);
        return;
      }
      if (
        formData.indicador_nome === "Oxigenação" &&
        (numeroConvertido < 50 || numeroConvertido > 100)
      ) {
        setErro("A Oxigenação (SpO₂) deve estar entre 50% e 100%.");
        setSalvando(false);
        return;
      }
      if (
        formData.indicador_nome === "Temperatura" &&
        (numeroConvertido < 30 || numeroConvertido > 45)
      ) {
        setErro("A Temperatura corporal deve estar entre 30 °C e 45 °C.");
        setSalvando(false);
        return;
      }
    }

    try {
      const indicadorId = await obterOuCriarIndicadorId(
        formData.indicador_nome,
        formData.unidade,
        token
      );

      const valorCategoricoFinal = isNumerico
        ? obsLimpa.length > 0
          ? obsLimpa
          : undefined
        : obsLimpa.length > 0
          ? `${valorLimpo} (${obsLimpa})`
          : valorLimpo;

      const payload: Record<string, any> = {
        idoso_id: idoso.id,
        ...(indicadorId && { indicador_id: indicadorId }),
        ...(isNumerico && { valor_numerico: numeroConvertido }),
        ...(valorCategoricoFinal && { valor_categorico: valorCategoricoFinal }),
        origem: "MANUAL",
        ...(usuarioId && { usuario_id: usuarioId }),
      };

      const res = await fetch(`${API_URL}/registro-saude`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const errData = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = Array.isArray(errData?.message)
          ? errData.message.join(", ")
          : errData?.message;
        throw new Error(
          msg || `Erro ${res.status}: Não foi possível registrar o sinal vital.`
        );
      }

      window.dispatchEvent(new Event("saspi_elderly_updated"));
      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/historico");
      }, 1500);
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao salvar o registro de saúde.");
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
          <p className="mt-2 text-sm font-medium">Validando permissões...</p>
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
            Modo Somente Leitura
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            O perfil Familiar é dedicado ao acompanhamento remoto e
            visualização, não permitindo a inserção de aferições clínicas.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/historico"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <ArrowLeft size={16} /> Voltar para o Histórico
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
          href="/dashboard/historico"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} /> Voltar para o histórico
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Registro de saúde
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo registro de saúde
          </h1>
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
              Sinal vital gravado com sucesso no banco de dados!
            </p>
          </div>
        )}

        {idoso && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-[#E8F1FB] p-4 text-[#0A2540]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1565C0] shadow-sm">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
                Paciente:
              </span>
              <p className="text-sm font-bold">
                {idoso.nome} ({idoso.idade} anos)
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <HeartPulse size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações da Aferição
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Indicador de saúde *
                </label>
                <select
                  value={formData.indicador_nome}
                  onChange={(e) => handleIndicadorChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="Frequência Cardíaca">
                    Frequência cardíaca
                  </option>
                  <option value="Oxigenação">Oxigenação (SpO₂)</option>
                  <option value="Pressão Arterial">Pressão arterial</option>
                  <option value="Temperatura">Temperatura corporal</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Valor aferido *
                </label>
                <input
                  type="text"
                  inputMode={
                    formData.indicador_nome === "Temperatura"
                      ? "decimal"
                      : "numeric"
                  }
                  required
                  value={formData.valor}
                  onChange={(e) => handleValorChange(e.target.value)}
                  placeholder={
                    formData.indicador_nome === "Pressão Arterial"
                      ? "Ex.: 120/80"
                      : formData.indicador_nome === "Temperatura"
                        ? "Ex.: 36.5"
                        : "Ex.: 72"
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Unidade
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.unidade}
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Observações clínicas
                </label>
                <textarea
                  rows={4}
                  value={formData.observacao}
                  onChange={(e) =>
                    setFormData({ ...formData, observacao: e.target.value })
                  }
                  placeholder="Ex.: Aferido em repouso após 15 minutos..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/historico"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando || !idoso}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-70"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Salvar registro
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}