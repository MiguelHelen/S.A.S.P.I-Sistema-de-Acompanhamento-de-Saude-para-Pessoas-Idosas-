"use client";

import React, { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Stethoscope,
  Plus,
} from "lucide-react";

interface Consulta {
  id: string;
  especialidade: string;
  medico: string;
  dataHora: string;
  localizacao: string;
  status: "Agendada" | "Confirmada" | "Realizada";
}

const CONSULTAS_POR_IDOSO: Record<string, Consulta[]> = {
  "1": [
    {
      id: "c1",
      especialidade: "Cardiologia",
      medico: "Dr. Roberto Faria",
      dataHora: "18/10 às 14:00",
      localizacao: "Hospital Central - Bloco B",
      status: "Agendada",
    },
    {
      id: "c2",
      especialidade: "Geriatria de Rotina",
      medico: "Dra. Camila Torres",
      dataHora: "25/10 às 09:30",
      localizacao: "Clínica Bem Viver",
      status: "Confirmada",
    },
  ],
  "2": [
    {
      id: "c3",
      especialidade: "Endocrinologia",
      medico: "Dr. Marcos Souza",
      dataHora: "20/10 às 10:00",
      localizacao: "Centro Médico Sul",
      status: "Agendada",
    },
  ],
  "3": [
    {
      id: "c4",
      especialidade: "Oftalmologia",
      medico: "Dra. Helena Ramos",
      dataHora: "05/11 às 15:30",
      localizacao: "Instituto da Visão",
      status: "Agendada",
    },
  ],
};

export default function ConsultasPage() {
  const [activeElderly, setActiveElderly] = useState<Idoso>({
    id: "1",
    nome: "Dona Francisca Silva",
    idade: 78,
  });

  useEffect(() => {
    const storedElderly = localStorage.getItem("saspi_active_elderly");
    if (storedElderly) {
      try {
        setActiveElderly(JSON.parse(storedElderly));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  function handleSelectElderly(novo: Idoso) {
    setActiveElderly(novo);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(novo));
  }

  const consultas = CONSULTAS_POR_IDOSO[activeElderly.id] || [];

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Agenda de saúde
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Consultas
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Acompanhe consultas e atendimentos agendados para{" "}
              <strong className="text-[#0A2540]">{activeElderly.nome}</strong>.
            </p>
          </div>

          <Link
            href="/dashboard/consultas/nova"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={19} />
            Nova consulta
          </Link>
        </div>

        {/* Seletor do paciente ativo */}
        <div className="mt-6">
          <PatientSelector
            onSelect={handleSelectElderly}
            selectedId={activeElderly.id}
          />
        </div>

        {consultas.length > 0 ? (
          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div>
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Próximas consultas ({consultas.length})
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Compromissos clínicos confirmados deste paciente.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {consultas.map((consulta) => (
                <article
                  key={consulta.id}
                  className="group rounded-2xl border border-gray-100 bg-[#FAFCFE] p-6 transition hover:-translate-y-0.5 hover:border-[#BFD8F2] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0] transition group-hover:bg-[#1565C0] group-hover:text-white">
                      <Stethoscope size={24} />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        consulta.status === "Agendada"
                          ? "bg-[#E8F1FB] text-[#1565C0]"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {consulta.status}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-[#0A2540]">
                      {consulta.especialidade}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {consulta.medico}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                        <CalendarDays size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Data e Horário</p>
                        <p className="mt-0.5 text-sm font-semibold text-[#0A2540]">
                          {consulta.dataHora}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                        <MapPin size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-500">Local</p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-[#0A2540]">
                          {consulta.localizacao}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <Stethoscope size={36} className="mx-auto text-gray-300" />
            <p className="mt-3 text-base font-semibold text-[#0A2540]">
              Nenhuma consulta agendada
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Não há agendamentos cadastrados para {activeElderly.nome}.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}