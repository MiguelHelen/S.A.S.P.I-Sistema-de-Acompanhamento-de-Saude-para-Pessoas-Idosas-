"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import Link from "next/link";
import { Pill, Plus, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";

interface Prescricao {
  id: string;
  medicamento: {
    nome: string;
    descricao?: string;
  };
  dosagem: string;
  frequencia: string;
  status: string;
  data_inicio: string;
}

export default function MedicamentosPage() {
  const [idosoAtivo, setIdosoAtivo] = useState<Idoso | null>(null);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [carregando, setCarregando] = useState(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://perfect-bravery-production-5ce7.up.railway.app";

  async function carregarPrescricoes(idosoId: string) {
    setCarregando(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("saspi_token") : null;

    try {
      const res = await fetch(`${apiUrl}/prescricao?idoso_id=${idosoId}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });

      if (res.ok) {
        const data = await res.json();
        setPrescricoes(Array.isArray(data) ? data : []);
      } else {
        setPrescricoes([]);
      }
    } catch {
      setPrescricoes([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("saspi_active_elderly");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIdosoAtivo(parsed);
        carregarPrescricoes(parsed.id);
      } catch {}
    }
  }, []);

  function handleSelectPatient(idoso: Idoso) {
    setIdosoAtivo(idoso);
    carregarPrescricoes(idoso.id);
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Farmacoterapia & Prescrições
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Plano de Medicamentos
            </h1>
            <p className="mt-2 text-gray-600">
              {idosoAtivo
                ? `Prescrições ativas e horários de dosagem de ${idosoAtivo.nome}.`
                : "Selecione um paciente para gerenciar a medicação."}
            </p>
          </div>

          <Link
            href="/dashboard/medicamentos/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={18} />
            Nova Prescrição
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          <PatientSelector onSelect={handleSelectPatient} />

          {/* Lista de Prescrições */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Pill size={20} />
                </div>
                <h2 className="text-lg font-semibold text-[#0A2540]">
                  Prescrições Médicas Ativas
                </h2>
              </div>
              <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {prescricoes.length} registradas
              </span>
            </div>

            <div className="mt-6">
              {carregando ? (
                <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                  <Loader2 size={24} className="animate-spin text-[#1565C0]" />
                  <span className="ml-2">Buscando prescrições no banco...</span>
                </div>
              ) : prescricoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                    <Pill size={28} />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A2540]">
                    Nenhuma prescrição encontrada
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-gray-500">
                    Não existem medicamentos prescritos registrados para este paciente até o momento.
                  </p>
                  <Link
                    href="/dashboard/medicamentos/novo"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E8F1FB] px-4 py-2 text-sm font-medium text-[#1565C0] hover:bg-[#1565C0] hover:text-white"
                  >
                    <Plus size={16} />
                    Adicionar primeiro medicamento
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {prescricoes.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-semibold text-[#0A2540]">
                          {p.medicamento?.nome || "Medicamento"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {p.dosagem} • {p.frequencia}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}