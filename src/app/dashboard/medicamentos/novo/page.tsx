"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  Clock3,
  Pill,
  Save,
  Loader2,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

export default function NovoMedicamento() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    dosagem: "",
    horario_primeira_dose: "",
    frequencia: "Uma vez ao dia (24h)",
    orientacoes: "",
  });

 const [idoso, setIdoso] = useState({ id: "1", nome: "Dona Francisca Silva", idade: 78 });

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

    // Simulação do envio com estado de loading
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/medicamentos");
      }, 1200);
    }, 600);
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/medicamentos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para medicamentos
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Rotina de cuidados
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Nova Prescrição
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Cadastre um novo medicamento para organizar a rotina e os alertas do paciente.
          </p>
        </div>

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Medicamento registrado com sucesso! Redirecionando...
            </p>
          </div>
        )}

        {/* Banner do paciente vinculado */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-[#E8F1FB] p-4 text-[#0A2540]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1565C0] shadow-sm">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
              Prescrição vinculada ao paciente:
            </span>
            <p className="text-sm font-bold">
              {idoso.nome} ({idoso.idade} anos)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                <Pill size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Dados da Medicação
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Preencha o nome, dosagem e regras de administração.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="nome" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Nome do medicamento *
                </label>
                <input
                  id="nome"
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex.: Losartana Potássica"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label htmlFor="dosagem" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Dosagem / Concentração *
                </label>
                <input
                  id="dosagem"
                  type="text"
                  required
                  value={formData.dosagem}
                  onChange={(e) => setFormData({ ...formData, dosagem: e.target.value })}
                  placeholder="Ex.: 50 mg"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div>
                <label htmlFor="horario_primeira_dose" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Horário da Primeira Dose *
                </label>
                <input
                  id="horario_primeira_dose"
                  type="time"
                  required
                  value={formData.horario_primeira_dose}
                  onChange={(e) => setFormData({ ...formData, horario_primeira_dose: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="frequencia" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Frequência / Intervalo *
                </label>
                <select
                  id="frequencia"
                  value={formData.frequencia}
                  onChange={(e) => setFormData({ ...formData, frequencia: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                >
                  <option value="A cada 8 horas (3x ao dia)">A cada 8 horas (3x ao dia)</option>
                  <option value="A cada 12 horas (2x ao dia)">A cada 12 horas (2x ao dia)</option>
                  <option value="Uma vez ao dia (24h)">Uma vez ao dia (24h)</option>
                  <option value="Antes de dormir">Antes de dormir</option>
                  <option value="Uso contínuo conforme necessidade">Uso contínuo conforme necessidade</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="orientacoes" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Orientações e Instruções de uso (opcional)
                </label>
                <textarea
                  id="orientacoes"
                  rows={4}
                  value={formData.orientacoes}
                  onChange={(e) => setFormData({ ...formData, orientacoes: e.target.value })}
                  placeholder="Ex.: Ingerir após o almoço com bastante água..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-[#D7EEE9] bg-[#F5FBF9] p-5">
            <Clock3 size={20} className="mt-0.5 shrink-0 text-[#26A69A]" />
            <p className="text-sm leading-relaxed text-gray-600">
              As informações configuradas aqui sincronizarão automaticamente com o Aplicativo Mobile, gerando alertas no celular do paciente e do cuidador.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/medicamentos"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:opacity-70"
            >
              {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {salvando ? "Salvando..." : "Salvar medicamento"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}