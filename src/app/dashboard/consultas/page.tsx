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
  data?: string;
  horario?: string;
  localizacao?: string;
  status: string;
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
      });

      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data || [];
        setConsultas(lista);
      } else {
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
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540]">
              Consultas
            </h1>
            <p className="mt-2 text-gray-600">
              {activeElderly
                ? `Acompanhe agendamentos de ${activeElderly.nome}.`
                : "Selecione um paciente para visualizar os agendamentos clínicos."}
            </p>
          </div>

          {podeAgendar && (
            <Link
              href="/dashboard/consultas/nova"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 font-medium text-white shadow-sm hover:bg-[#0A2540]"
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
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 size={24} className="animate-spin text-[#1565C0]" />
              <span className="ml-2">Buscando consultas na base...</span>
            </div>
          ) : consultas.length > 0 ? (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#0A2540]">
                Consultas agendadas ({consultas.length})
              </h2>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {consultas.map((c) => {
                  const dataBr = c.data
                    ? new Date(c.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
                    : "--";

                  return (
                    <article
                      key={c.id}
                      className="group rounded-2xl border border-gray-100 bg-[#FAFCFE] p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                          <Stethoscope size={24} />
                        </div>
                        <span className="rounded-full bg-[#E8F1FB] px-3 py-1 text-xs font-semibold text-[#1565C0]">
                          {c.status || "Agendada"}
                        </span>
                      </div>
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold text-[#0A2540]">
                          {c.especialidade}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-gray-500">
                          {c.medico}
                        </p>
                      </div>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 border border-gray-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F1FB] text-[#1565C0]">
                            <CalendarDays size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Data/Hora</p>
                            <p className="text-sm font-semibold text-[#0A2540]">
                              {dataBr} às {c.horario}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 border border-gray-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F4EF] text-[#26A69A]">
                            <MapPin size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs text-gray-500">Local</p>
                            <p className="truncate text-sm font-semibold text-[#0A2540]">
                              {c.localizacao}
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
              <p className="mt-3 font-semibold text-[#0A2540]">
                Nenhuma consulta agendada
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}