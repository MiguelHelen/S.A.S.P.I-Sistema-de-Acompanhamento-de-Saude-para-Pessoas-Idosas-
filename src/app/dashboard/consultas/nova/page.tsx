"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  UserCheck,
  Save,
  Loader2,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

export default function NovaConsulta() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [idoso, setIdoso] = useState({
    id: "1",
    nome: "Dona Francisca Silva",
    idade: 78,
  });

  const [formData, setFormData] = useState({
    especialidade: "",
    profissional: "",
    data: "",
    horario: "",
    local: "",
    observacao: "",
  });

  useEffect(() => {
    const activeElderly = localStorage.getItem("saspi_active_elderly");
    if (activeElderly) {
      try {
        setIdoso(JSON.parse(activeElderly));
      } catch (e) {
        console.error("Erro ao ler idoso ativo:", e);
      }
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    // Simulação do salvamento vinculando a consulta ao idoso ativo
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/consultas");
      }, 1200);
    }, 600);
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

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Consulta agendada com sucesso! Redirecionando...
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
                Agendamento vinculado ao paciente:
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
                <Stethoscope size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Informações da consulta
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados principais do atendimento.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="especialidade"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Especialidade *
                </label>
                <input
                  id="especialidade"
                  type="text"
                  required
                  value={formData.especialidade}
                  onChange={(e) =>
                    setFormData({ ...formData, especialidade: e.target.value })
                  }
                  placeholder="Ex.: Cardiologia, Geriatria, Oftalmologia"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="profissional"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Profissional *
                </label>
                <input
                  id="profissional"
                  type="text"
                  required
                  value={formData.profissional}
                  onChange={(e) =>
                    setFormData({ ...formData, profissional: e.target.value })
                  }
                  placeholder="Ex.: Dr. Roberto Faria"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="data"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Data *
                </label>
                <input
                  id="data"
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="horario"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Horário *
                </label>
                <input
                  id="horario"
                  type="time"
                  required
                  value={formData.horario}
                  onChange={(e) =>
                    setFormData({ ...formData, horario: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="local"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Local da consulta *
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="local"
                    type="text"
                    required
                    value={formData.local}
                    onChange={(e) =>
                      setFormData({ ...formData, local: e.target.value })
                    }
                    placeholder="Ex.: Hospital Central - Bloco B"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="observacao"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Observações e Preparos
                </label>
                <textarea
                  id="observacao"
                  rows={4}
                  value={formData.observacao}
                  onChange={(e) =>
                    setFormData({ ...formData, observacao: e.target.value })
                  }
                  placeholder="Ex.: Levar exames recentes de sangue e ECG. Jejum de 8h"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-[#DCEAF8] bg-[#F8FBFE] p-5">
            <CalendarDays size={20} className="mt-0.5 shrink-0 text-[#1565C0]" />
            <p className="text-sm leading-relaxed text-gray-600">
              A consulta cadastrada aparecerá na agenda e nos lembretes do acompanhamento web e mobile.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/consultas"
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
              {salvando ? "Agendando..." : "Salvar consulta"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}