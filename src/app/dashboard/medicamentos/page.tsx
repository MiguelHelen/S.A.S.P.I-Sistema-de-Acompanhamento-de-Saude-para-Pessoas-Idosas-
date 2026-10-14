"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import Link from "next/link";
import { Clock3, Pill, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface MedicamentoItem {
  id: string;
  nome: string;
  dosagem: string;
  horario: string;
  frequencia: string;
  status: "tomado" | "proximo" | "pendente";
}

const MEDICAMENTOS_POR_IDOSO: Record<string, MedicamentoItem[]> = {
  "1": [
    {
      id: "m1",
      nome: "Losartana Potássica",
      dosagem: "50 mg",
      horario: "Hoje às 20:00",
      frequencia: "Uma vez ao dia",
      status: "proximo",
    },
    {
      id: "m2",
      nome: "Sinvastatina",
      dosagem: "20 mg",
      horario: "Hoje às 22:00",
      frequencia: "Uma vez ao dia (Noite)",
      status: "pendente",
    },
  ],
  "2": [
    {
      id: "m3",
      nome: "Metformina",
      dosagem: "850 mg",
      horario: "Amanhã às 08:00",
      frequencia: "A cada 12 horas",
      status: "tomado",
    },
    {
      id: "m4",
      nome: "Insulina NPH",
      dosagem: "15 UI",
      horario: "Hoje às 21:00",
      frequencia: "Antes de dormir",
      status: "proximo",
    },
  ],
  "3": [
    {
      id: "m5",
      nome: "Atenolol",
      dosagem: "25 mg",
      horario: "Hoje às 08:00",
      frequencia: "Uma vez ao dia",
      status: "tomado",
    },
  ],
};

export default function Medicamentos() {
  const [idoso, setIdoso] = useState<Idoso>({
    id: "1",
    nome: "Dona Francisca Silva",
    idade: 78,
  });

  useEffect(() => {
    const saved = localStorage.getItem("saspi_active_elderly");
    if (saved) {
      try {
        setIdoso(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  function handleSelectIdoso(novo: Idoso) {
    setIdoso(novo);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(novo));
  }

  const lista = MEDICAMENTOS_POR_IDOSO[idoso.id] || [];

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Rotina de cuidados e prescrições
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Medicamentos
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Prescrições e horários de medicação de{" "}
              <strong className="text-[#0A2540]">{idoso.nome}</strong>.
            </p>
          </div>

          <Link
            href="/dashboard/medicamentos/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={19} />
            Novo medicamento
          </Link>
        </div>

        {/* Seletor do Paciente Ativo */}
        <div className="mt-6">
          <PatientSelector onSelect={handleSelectIdoso} selectedId={idoso.id} />
        </div>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div>
            <h2 className="text-xl font-semibold text-[#0A2540]">
              Medicamentos cadastrados ({lista.length})
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Consulte a rotina de dosagens associada a este paciente.
            </p>
          </div>

          {lista.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Nenhum medicamento registrado para este idoso.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {lista.map((med) => (
                <article
                  key={med.id}
                  className="group rounded-2xl border border-gray-100 bg-[#FAFCFE] p-6 transition hover:-translate-y-0.5 hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                      <Pill size={24} />
                    </div>

                    {med.status === "tomado" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 size={13} />
                        Tomado
                      </span>
                    )}
                    {med.status === "proximo" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F1FB] px-3 py-1 text-xs font-semibold text-[#1565C0]">
                        <Clock3 size={13} />
                        Próximo
                      </span>
                    )}
                    {med.status === "pendente" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <AlertCircle size={13} />
                        Pendente
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-[#0A2540]">
                      {med.nome}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {med.dosagem}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Próximo horário</p>
                      <p className="mt-1 font-semibold text-[#0A2540]">
                        {med.horario}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    Frequência: {med.frequencia}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}