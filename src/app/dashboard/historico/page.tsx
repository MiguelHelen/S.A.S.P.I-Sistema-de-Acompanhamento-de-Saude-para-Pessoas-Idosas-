"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import {
  CalendarDays,
  HeartPulse,
  Pill,
  Plus,
  Filter,
  History,
  Loader2,
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function HistoricoPage() {
  const [idoso, setIdoso] = useState<Idoso | null>(null);
  const [eventos, setEventos] = useState<EventoHistorico[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    "todos" | "sinal_vital" | "medicamento" | "consulta"
  >("todos");

  const carregarHistorico = useCallback(async (idosoId: string) => {
    setCarregando(true);
    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(`${API_URL}/registro-saude?idoso_id=${idosoId}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });

      if (res.ok) {
        const data = await res.json();
        const listaMapeada: EventoHistorico[] = (Array.isArray(data) ? data : []).map(
          (item: any) => {
            const dataFormatada = item.created_at
              ? new Date(item.created_at).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "Registro recente";

            return {
              id: item.id,
              tipo: "sinal_vital" as const,
              titulo: item.indicador_nome || "Sinal Vital",
              descricao: `${item.valor || ""} ${item.unidade || ""} ${
                item.observacao ? `• ${item.observacao}` : ""
              }`,
              dataHora: dataFormatada,
              autor: item.origem || "Equipe de Cuidado",
            };
          }
        );

        setEventos(listaMapeada);
      } else {
        setEventos([]);
      }
    } catch {
      setEventos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const activeElderly = localStorage.getItem("saspi_active_elderly");
    if (activeElderly) {
      try {
        const parsed = JSON.parse(activeElderly);
        setIdoso(parsed);
        if (parsed?.id) {
          carregarHistorico(parsed.id);
        }
      } catch {}
    }
  }, [carregarHistorico]);

  function handleSelectElderly(novo: Idoso) {
    setIdoso(novo);
    if (novo?.id) {
      carregarHistorico(novo.id);
    }
  }

  const eventosFiltrados = eventos.filter(
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
              {idoso ? (
                <>
                  Linha do tempo cronológica com aferições, medicamentos e
                  atendimentos de{" "}
                  <strong className="text-[#0A2540]">{idoso.nome}</strong>.
                </>
              ) : (
                "Selecione um paciente para consultar o histórico clínico."
              )}
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

        <div className="mt-6">
          <PatientSelector
            onSelect={handleSelectElderly}
            selectedId={idoso?.id}
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
                      filtro.valor as
                        | "todos"
                        | "sinal_vital"
                        | "medicamento"
                        | "consulta"
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

          {carregando ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <Loader2 size={24} className="animate-spin text-[#1565C0]" />
              <span className="ml-2">Buscando histórico no banco de dados...</span>
            </div>
          ) : eventosFiltrados.length > 0 ? (
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
                      <p className="font-semibold text-[#0A2540]">
                        {evento.titulo}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {evento.dataHora}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        {evento.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:text-right">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#1565C0]">
                      Origem: <strong>{evento.autor}</strong>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              {idoso
                ? `Nenhum registro encontrado no banco para ${idoso.nome}.`
                : "Selecione um paciente para exibir os registros."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}