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
} from "lucide-react";

interface EventoHistorico {
  id: string;
  tipo: "sinal_vital" | "medicamento" | "consulta";
  titulo: string;
  descricao: string;
  dataHora: string;
  autor: string;
  timestamp: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function HistoricoPage() {
  const [idoso, setIdoso] = useState<Idoso | null>(null);
  const [eventos, setEventos] = useState<EventoHistorico[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState("");

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    "todos" | "sinal_vital" | "medicamento" | "consulta"
  >("todos");

  const carregarHistorico = useCallback(async (idosoId: string) => {
    setCarregando(true);
    const token = localStorage.getItem("saspi_token");
    const headers = { ...(token && { Authorization: `Bearer ${token}` }) };

    try {
      const [resSaude, resPresc, resCons] = await Promise.all([
        fetch(`${API_URL}/registro-saude/idoso/${idosoId}`, { headers }).catch(
          () => null
        ),
        fetch(`${API_URL}/prescricao/idoso/${idosoId}`, { headers }).catch(
          () => null
        ),
        fetch(`${API_URL}/consulta?idoso_id=${idosoId}`, { headers }).catch(
          () => null
        ),
      ]);

      const eventosUnificados: EventoHistorico[] = [];

      if (resSaude?.ok) {
        const dataSaude = await resSaude.json();
        const arrSaude = Array.isArray(dataSaude)
          ? dataSaude
          : dataSaude.data || [];

        arrSaude
          .filter((item: any) => !item.idoso_id || item.idoso_id === idosoId)
          .forEach((item: any) => {
            const rawDate = item.data_hora || item.created_at;
            const parsedTime = rawDate ? new Date(rawDate).getTime() : 0;
            const dataFormatada = rawDate
              ? new Date(rawDate).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "Registro recente";

            const nomeIndicador =
              item.indicador_saude?.nome ||
              item.indicador_nome ||
              "Sinal Vital";
            const unidade =
              item.indicador_saude?.unidade_padrao || item.unidade || "";
            const valorPrincipal =
              item.valor_numerico !== null && item.valor_numerico !== undefined
                ? `${item.valor_numerico} ${unidade}`.trim()
                : `${item.valor_categorico || item.valor || ""} ${unidade}`.trim();

            const complemento =
              item.valor_numerico !== null &&
              item.valor_numerico !== undefined &&
              item.valor_categorico
                ? ` • ${item.valor_categorico}`
                : item.observacao
                  ? ` • ${item.observacao}`
                  : "";

            const autorFormatado =
              item.usuario?.nome ||
              (String(item.origem || "").toUpperCase() === "AUTOMATICO"
                ? "Smartband (Automático)"
                : "Registro Manual");

            eventosUnificados.push({
              id: `saude-${item.id}`,
              tipo: "sinal_vital",
              titulo: nomeIndicador,
              descricao: `${valorPrincipal}${complemento}`,
              dataHora: dataFormatada,
              autor: autorFormatado,
              timestamp: Number.isNaN(parsedTime) ? 0 : parsedTime,
            });
          });
      }

      if (resPresc?.ok) {
        const dataPresc = await resPresc.json();
        const arrPresc = Array.isArray(dataPresc)
          ? dataPresc
          : dataPresc.data || [];

        arrPresc
          .filter((p: any) => !p.idoso_id || p.idoso_id === idosoId)
          .forEach((p: any) => {
            const parsedTime = p.data_inicio
              ? new Date(p.data_inicio).getTime()
              : 0;
            const dataFormatada = p.data_inicio
              ? new Date(p.data_inicio).toLocaleDateString("pt-BR", {
                  timeZone: "UTC",
                })
              : "Prescrição ativa";

            eventosUnificados.push({
              id: `presc-${p.id}`,
              tipo: "medicamento",
              titulo: p.medicamento?.nome || "Prescrição Medicamentosa",
              descricao: `${p.dosagem || ""} • ${p.frequencia || "Uso contínuo"}`,
              dataHora: dataFormatada,
              autor: p.usuario?.nome || "Equipe Médica",
              timestamp: Number.isNaN(parsedTime) ? 0 : parsedTime,
            });
          });
      }

      if (resCons?.ok) {
        const dataCons = await resCons.json();
        const arrCons = Array.isArray(dataCons)
          ? dataCons
          : dataCons.data || [];

        arrCons
          .filter((c: any) => !c.idoso_id || c.idoso_id === idosoId)
          .forEach((c: any) => {
            const rawIso = c.created_at || c.data;
            const parsedTime = rawIso ? new Date(rawIso).getTime() : 0;
            const dataFormatada = c.data
              ? `${new Date(c.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às ${c.horario || ""}`
              : "Consulta agendada";

            eventosUnificados.push({
              id: `cons-${c.id}`,
              tipo: "consulta",
              titulo: `Consulta: ${c.especialidade}`,
              descricao: `${c.localizacao || ""} • Status: ${c.status || "Agendada"}`,
              dataHora: dataFormatada,
              autor: c.medico || "Médico Responsável",
              timestamp: Number.isNaN(parsedTime) ? 0 : parsedTime,
            });
          });
      }

      // Ordena cronologicamente do evento mais recente para o mais antigo
      eventosUnificados.sort((a, b) => b.timestamp - a.timestamp);
      setEventos(eventosUnificados);
    } catch {
      setEventos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const userRaw = localStorage.getItem("saspi_user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        const userData = parsed.user || parsed.usuario || parsed;
        setPerfilUsuario(
          String(userData.perfil || userData.role || "").toUpperCase()
        );
      } catch {}
    }

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

  const podeRegistrar = perfilUsuario !== "FAMILIAR";

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

          {podeRegistrar && (
            <Link
              href="/dashboard/historico/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <Plus size={19} />
              Novo registro
            </Link>
          )}
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
              <span className="ml-2">
                Buscando histórico no banco de dados...
              </span>
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
                      Responsável: <strong>{evento.autor}</strong>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              {idoso
                ? `Nenhum registro encontrado para ${idoso.nome} nesta categoria.`
                : "Selecione um paciente para exibir os registros."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}