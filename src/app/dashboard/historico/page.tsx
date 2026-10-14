"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import Link from "next/link";
import {
  CalendarDays,
  HeartPulse,
  Pill,
  Plus,
  Filter,
  History,
  Activity,
} from "lucide-react";

interface EventoHistorico {
  id: string;
  tipo: "sinal_vital" | "medicamento" | "consulta";
  titulo: string;
  descricao: string;
  dataHora: string;
  autor: string;
}

const mockEventos: Record<string, EventoHistorico[]> = {
  "1": [
    {
      id: "h1",
      tipo: "sinal_vital",
      titulo: "Frequência Cardíaca",
      descricao: "74 bpm (Estável)",
      dataHora: "Hoje às 16:30",
      autor: "Dr. Wallex André",
    },
    {
      id: "h2",
      tipo: "medicamento",
      titulo: "Losartana 50mg",
      descricao: "Dose administrada e confirmada",
      dataHora: "Hoje às 08:00",
      autor: "Cuidador Noturno",
    },
    {
      id: "h3",
      tipo: "consulta",
      titulo: "Consulta de Cardiologia",
      descricao: "Hospital Central - Dr. Roberto Faria",
      dataHora: "Ontem às 14:00",
      autor: "Dr. Wallex André",
    },
  ],
  "2": [
    {
      id: "h4",
      tipo: "sinal_vital",
      titulo: "Pressão Arterial",
      descricao: "130/85 mmHg",
      dataHora: "Hoje às 09:15",
      autor: "Enf. Roberta",
    },
    {
      id: "h5",
      tipo: "medicamento",
      titulo: "Metformina 850mg",
      descricao: "Tomado com o pequeno-almoço",
      dataHora: "Hoje às 08:30",
      autor: "Cuidador Diurno",
    },
  ],
  "3": [
    {
      id: "h6",
      tipo: "consulta",
      titulo: "Reavaliação Geriátrica",
      descricao: "Clínica Bem Viver",
      dataHora: "12/10 às 10:00",
      autor: "Dra. Camila Torres",
    },
  ],
};

export default function HistoricoPage() {
  const [idoso, setIdoso] = useState<Idoso>({
    id: "1",
    nome: "Dona Francisca Silva",
    idade: 78,
  });

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    "todos" | "sinal_vital" | "medicamento" | "consulta"
  >("todos");

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

  function handleSelectElderly(novo: Idoso) {
    setIdoso(novo);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(novo));
  }

  const eventosDoIdoso = mockEventos[idoso.id] || [];
  const eventosFiltrados = eventosDoIdoso.filter(
    (evento) =>
      categoriaSelecionada === "todos" || evento.tipo === categoriaSelecionada
  );

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Prontuário e Rastreabilidade
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Histórico de Saúde
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Linha do tempo cronológica com aferições, medicamentos e atendimentos de{" "}
              <strong className="text-[#0A2540]">{idoso.nome}</strong>.
            </p>
          </div>

          <Link
            href="/dashboard/historico/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
          >
            <Plus size={19} />
            Novo registro
          </Link>
        </div>

        {/* Seletor de Idoso integrado no container */}
        <div className="mt-6">
          <PatientSelector
            onSelect={handleSelectElderly}
            selectedId={idoso.id}
          />
        </div>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <History size={20} className="text-[#26A69A]" />
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Linha do Tempo Recente
              </h2>
            </div>

            {/* Filtros em botões rápidos */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              {[
                { label: "Todos", valor: "todos" },
                { label: "Sinais Vitais", valor: "sinal_vital" },
                { label: "Medicamentos", valor: "medicamento" },
                { label: "Consultas", valor: "consulta" },
              ].map((filtro) => (
                <button
                  key={filtro.valor}
                  type="button"
                  onClick={() =>
                    setCategoriaSelecionada(
                      filtro.valor as "todos" | "sinal_vital" | "medicamento" | "consulta"
                    )
                  }
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    categoriaSelecionada === filtro.valor
                      ? "bg-[#1565C0] text-white shadow-sm"
                      : "border border-gray-200 bg-[#FAFCFE] text-gray-600 hover:border-[#BFD8F2] hover:text-[#0A2540]"
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>

          {eventosFiltrados.length > 0 ? (
            <ul className="mt-8 space-y-4">
              {eventosFiltrados.map((evento) => (
                <li
                  key={evento.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    {evento.tipo === "sinal_vital" && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                        <HeartPulse size={24} />
                      </div>
                    )}
                    {evento.tipo === "medicamento" && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                        <Pill size={24} />
                      </div>
                    )}
                    {evento.tipo === "consulta" && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                        <CalendarDays size={24} />
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-[#0A2540]">{evento.titulo}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{evento.dataHora}</p>
                      <p className="mt-2 text-sm text-gray-600">{evento.descricao}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:text-right">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#1565C0]">
                      Registado por: <strong>{evento.autor}</strong>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Nenhum registo encontrado para a categoria selecionada.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}