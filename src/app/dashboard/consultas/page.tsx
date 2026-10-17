"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import PatientSelector, { Idoso } from "@/components/PatientSelector";
import { CalendarDays, MapPin, Stethoscope, Plus, Loader2 } from "lucide-react";

interface Consulta {
  id: string;
  idoso_id?: string;
  especialidade: string;
  medico?: string;
  medico_nome?: string;
  data?: string;
  horario?: string;
  dataHora?: string;
  localizacao?: string;
  local?: string;
  status: "Agendada" | "Confirmada" | "Realizada";
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function ConsultasPage() {
  const [activeElderly, setActiveElderly] = useState<Idoso | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState("");

  const carregarConsultas = useCallback(async (idosoId: string) => {
    setCarregando(true);
    const token = localStorage.getItem("saspi_token");

    try {
      const res = await fetch(`${API_URL}/consulta?idoso_id=${idosoId}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      }).catch(() => null);

      if (res?.ok) {
        const data = await res.json();
        setConsultas(Array.isArray(data) ? data : []);
      } else {
        const localRaw = localStorage.getItem("saspi_consultas_list");
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed)) {
            setConsultas(parsed.filter((c: any) => c.idoso_id === idosoId));
            return;
          }
        }
        setConsultas([]);
      }
    } catch {
      setConsultas([]);
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

    const storedElderly = localStorage.getItem("saspi_active_elderly");
    if (storedElderly) {
      try {
        const parsed = JSON.parse(storedElderly);
        setActiveElderly(parsed);
        if (parsed?.id) {
          carregarConsultas(parsed.id);
        }
      } catch {}
    }
  }, [carregarConsultas]);

  function handleSelectElderly(novo: Idoso) {
    setActiveElderly(novo);
    if (novo?.id) {
      carregarConsultas(novo.id);
    }
  }

  const podeAgendar = perfilUsuario !== "FAMILIAR";

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
              {activeElderly ? (
                <>
                  Acompanhe consultas e atendimentos agendados para{" "}
                  <strong className="text-[#0A2540]">
                    {activeElderly.nome}
                  </strong>
                  .
                </>
              ) : (
                "Selecione um paciente para visualizar os agendamentos clínicos."
              )}
            </p>
          </div>

          {podeAgendar && (
            <Link
              href="/dashboard/consultas/nova"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md"
            >
              <Plus size={19} />
              Nova consulta
            </Link>
          )}
        </div>

        <div className="mt-6">
          <PatientSelector
            onSelect={handleSelectElderly}
            selectedId={activeElderly?.id}
          />
        </div>

        <div className="mt-8">
          {carregando ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <Loader2 size={24} className="animate-spin text-[#1565C0]" />
              <span className="ml-2">
                Buscando consultas no banco de dados...
              </span>
            </div>
          ) : consultas.length > 0 ? (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <div>
                <h2 className="text-xl font-semibold text-[#0A2540]">
                  Próximas consultas ({consultas.length})
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Compromissos clínicos confirmados deste paciente.
                </p>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {consultas.map((consulta) => {
                  const medicoNome =
                    consulta.medico ||
                    consulta.medico_nome ||
                    "Profissional não informado";
                  const localNome =
                    consulta.localizacao ||
                    consulta.local ||
                    "Local não informado";
                  const dataHoraFormatada =
                    consulta.dataHora ||
                    `${consulta.data || ""} às ${consulta.horario || ""}`;

                  return (
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
                          {consulta.status || "Agendada"}
                        </span>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-xl font-semibold text-[#0A2540]">
                          {consulta.especialidade}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-gray-500">
                          {medicoNome}
                        </p>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                            <CalendarDays size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Data e Horário
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-[#0A2540]">
                              {dataHoraFormatada}
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
                              {localNome}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <Stethoscope size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 text-base font-semibold text-[#0A2540]">
                Nenhuma consulta agendada
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {activeElderly
                  ? `Não há agendamentos cadastrados para ${activeElderly.nome}.`
                  : "Selecione um paciente acima para consultar a agenda."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}