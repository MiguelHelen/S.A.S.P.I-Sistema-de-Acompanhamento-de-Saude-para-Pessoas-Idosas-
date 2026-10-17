"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import type { Idoso } from "@/components/PatientSelector";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  UserCheck,
  Save,
  Loader2,
  CheckCircle2,
  Stethoscope,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function NovaConsulta() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [idoso, setIdoso] = useState<Idoso | null>(null);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [usuarioId, setUsuarioId] = useState<string>("");

  const [formData, setFormData] = useState({
    especialidade: "",
    profissional: "",
    data: "",
    horario: "",
    local: "",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    if (!idoso || !idoso.id) {
      setErro(
        "Nenhum paciente ativo selecionado. Selecione um paciente no topo do painel."
      );
      setSalvando(false);
      return;
    }

    // Tratamento de Data para evitar ERRO 500 no DateTime do PostgreSQL
    let dataFormatada = formData.data;
    try {
      const dataObj = new Date(formData.data);
      if (Number.isNaN(dataObj.getTime())) throw new Error();
      dataFormatada = dataObj.toISOString().split("T")[0]; // YYYY-MM-DD
    } catch {
      setErro("Data selecionada é inválida.");
      setSalvando(false);
      return;
    }

    const token = localStorage.getItem("saspi_token");

    const payload = {
      idoso_id: idoso.id,
      usuario_id: usuarioId || undefined,
      especialidade: formData.especialidade.trim(),
      medico: formData.profissional.trim(),
      data: dataFormatada,
      horario: formData.horario.trim(),
      localizacao: formData.local.trim(),
      observacao: formData.observacao.trim() || undefined,
      status: "Agendada",
    };

    try {
      const res = await fetch(`${API_URL}/consulta`, {
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
          msg || `Erro ${res.status}: Falha ao registrar agendamento.`
        );
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/consultas");
      }, 1500);
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao salvar agendamento.");
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
            O perfil Familiar possui permissão exclusiva para visualização da agenda clínica.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/consultas"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <ArrowLeft size={16} />
              Voltar para Consultas
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
          href="/dashboard/consultas"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para consultas
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Agenda de saúde
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Nova consulta
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Registre as informações do próximo atendimento para manter a agenda organizada.
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
              Consulta agendada com sucesso! Redirecionando...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <Stethoscope size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações da consulta
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">Especialidade *</label>
                <input
                  type="text"
                  required
                  value={formData.especialidade}
                  onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">Profissional *</label>
                <input
                  type="text"
                  required
                  value={formData.profissional}
                  onChange={(e) => setFormData({ ...formData, profissional: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">Data *</label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">Horário *</label>
                <input
                  type="time"
                  required
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">Local da consulta *</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#0A2540]">Observações e Preparos</label>
                <textarea
                  rows={4}
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/consultas"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={salvando || !idoso}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm disabled:opacity-70"
            >
              {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar consulta
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}