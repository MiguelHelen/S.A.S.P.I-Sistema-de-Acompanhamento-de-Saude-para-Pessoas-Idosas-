"use client";

import { useEffect, useState, useCallback } from "react";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
} from "@/lib/clinica";
import { Users, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export interface Idoso {
  id: string;
  nome: string;
  idade: number;
  data_nascimento?: string;
  quarto?: string | null;
  foto_url?: string | null;
  condicoes?: string | null;
  telefone_emergencia?: string | null;
  clinica_id?: string;
}

interface PatientSelectorProps {
  onSelect: (idoso: Idoso) => void;
  selectedId?: string;
}

export function calcularIdadeReal(dataNascimento?: string | null): number {
  if (!dataNascimento) return 0;
  const limpa = String(dataNascimento).split("T")[0];
  const partes = limpa.split("-");
  if (partes.length !== 3) return 0;

  const ano = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const dia = Number(partes[2]);
  if (Number.isNaN(ano) || Number.isNaN(mes) || Number.isNaN(dia)) return 0;

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  const diffMes = hoje.getMonth() - mes;
  if (diffMes < 0 || (diffMes === 0 && hoje.getDate() < dia)) {
    idade--;
  }
  return idade > 0 ? idade : 0;
}

function normalizarIdoso(bruto: any): Idoso {
  const idadeCalculada = calcularIdadeReal(bruto.data_nascimento);
  return {
    id: String(bruto.id || ""),
    nome: String(bruto.nome || "Paciente"),
    idade: idadeCalculada > 0 ? idadeCalculada : Number(bruto.idade || 0),
    data_nascimento: bruto.data_nascimento,
    quarto: bruto.quarto || null,
    foto_url: bruto.foto_url || null,
    condicoes: bruto.condicoes || null,
    telefone_emergencia: bruto.telefone_emergencia || null,
    clinica_id: bruto.clinica_id || undefined,
  };
}

export default function PatientSelector({
  onSelect,
  selectedId,
}: PatientSelectorProps) {
  const [idosos, setIdosos] = useState<Idoso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarIdosos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const usuario = getUsuarioSessao();
    if (!usuario?.id) {
      setIdosos([]);
      setCarregando(false);
      return;
    }

    const headers = getAuthHeaders(false);

    try {
      let listaNormalizada: Idoso[] = [];

      const resVinculos = await fetch(
        `${API_URL}/usuario-idoso/usuario/${usuario.id}`,
        { headers }
      ).catch(() => null);

      if (resVinculos?.ok) {
        const dataVinculos = await resVinculos.json();
        const arrVinculos = Array.isArray(dataVinculos)
          ? dataVinculos
          : dataVinculos?.data || [];

        const extraidos = arrVinculos
          .map((v: any) => v.idoso || (v.nome ? v : null))
          .filter((item: any) => Boolean(item?.id))
          .filter(
            (item: any) =>
              !usuario.clinica_id ||
              !item.clinica_id ||
              item.clinica_id === usuario.clinica_id
          )
          .map(normalizarIdoso);

        const mapaUnico = new Map<string, Idoso>();
        extraidos.forEach((i: Idoso) => mapaUnico.set(i.id, i));
        listaNormalizada = Array.from(mapaUnico.values());
      }

      if (
        listaNormalizada.length === 0 &&
        usuario.clinica_id &&
        usuario.perfil !== "FAMILIAR"
      ) {
        const resClinica = await fetch(
          `${API_URL}/idoso?clinica_id=${usuario.clinica_id}`,
          { headers }
        ).catch(() => null);

        if (resClinica?.ok) {
          const dataClinica = await resClinica.json();
          const arrClinica = Array.isArray(dataClinica)
            ? dataClinica
            : dataClinica?.data || [];

          listaNormalizada = arrClinica
            .filter(
              (item: any) =>
                !item.clinica_id || item.clinica_id === usuario.clinica_id
            )
            .map(normalizarIdoso);
        }
      }

      setIdosos(listaNormalizada);

      if (listaNormalizada.length > 0) {
        let ativoStorage: Idoso | null = null;
        try {
          const raw = localStorage.getItem("saspi_active_elderly");
          if (raw) ativoStorage = JSON.parse(raw);
        } catch {}

        const idPreferencial = selectedId || ativoStorage?.id;
        const encontrado =
          listaNormalizada.find((i) => i.id === idPreferencial) ||
          listaNormalizada[0];

        localStorage.setItem(
          "saspi_active_elderly",
          JSON.stringify(encontrado)
        );
        onSelect(encontrado);
      } else {
        localStorage.removeItem("saspi_active_elderly");
      }
    } catch {
      setErro("Não foi possível carregar a lista de pacientes vinculados.");
      setIdosos([]);
    } finally {
      setCarregando(false);
    }
  }, [onSelect, selectedId]);

  useEffect(() => {
    carregarIdosos();

    function handleAtualizacaoExterna() {
      carregarIdosos();
    }

    window.addEventListener("saspi_elderly_updated", handleAtualizacaoExterna);
    return () => {
      window.removeEventListener(
        "saspi_elderly_updated",
        handleAtualizacaoExterna
      );
    };
  }, [carregarIdosos]);

  function selecionarPaciente(idoso: Idoso) {
    localStorage.setItem("saspi_active_elderly", JSON.stringify(idoso));
    onSelect(idoso);
  }

  if (carregando) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-500 shadow-sm">
        <Loader2 size={18} className="animate-spin text-[#1565C0]" />
        <span>Carregando pacientes sob acompanhamento...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle size={18} className="shrink-0 text-red-600" />
        <span>{erro}</span>
      </div>
    );
  }

  if (idosos.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
        <Users size={18} className="shrink-0 text-gray-400" />
        <span>
          Nenhum paciente vinculado ao seu perfil no momento. Solicite ao
          administrador da clínica a vinculação do idoso.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <Users size={15} className="text-[#1565C0]" />
        <span>Paciente em Acompanhamento ({idosos.length})</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {idosos.map((idoso) => {
          const ativo = idoso.id === selectedId;
          const iniciais = idoso.nome
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")
            .toUpperCase();

          return (
            <button
              key={idoso.id}
              type="button"
              onClick={() => selecionarPaciente(idoso)}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
                ativo
                  ? "border-[#1565C0] bg-[#E8F1FB] text-[#0A2540] shadow-xs"
                  : "border-gray-200 bg-[#FAFCFE] text-gray-700 hover:border-[#BFD8F2] hover:bg-white"
              }`}
            >
              {idoso.foto_url ? (
                <img
                  src={idoso.foto_url}
                  alt={idoso.nome}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    ativo
                      ? "bg-[#1565C0] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {iniciais || "ID"}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold leading-tight">
                  {idoso.nome}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {idoso.idade > 0 ? `${idoso.idade} anos` : "Paciente ativo"}
                  {idoso.quarto ? ` • ${idoso.quarto}` : ""}
                </p>
              </div>

              {ativo && (
                <CheckCircle2
                  size={16}
                  className="ml-1 shrink-0 text-[#1565C0]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}