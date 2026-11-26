"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  normalizarPerfil,
} from "@/lib/clinica";
import {
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
  Phone,
  Calendar,
  FileText,
  UserCheck,
} from "lucide-react";

export interface Idoso {
  id: string;
  nome: string;
  idade: number;
  cpf?: string | null;
  data_nascimento?: string | null;
  sexo?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  clinica_id?: string;
  created_at?: string;
  foto_url?: string | null;
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

export function formatarCpf(cpf?: string | null): string {
  const digitos = String(cpf || "").replace(/\D/g, "");
  if (digitos.length !== 11) return digitos || "";
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarDataBr(dataStr?: string | null): string {
  if (!dataStr) return "";
  const limpa = String(dataStr).split("T")[0];
  const partes = limpa.split("-");
  if (partes.length !== 3) return limpa;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function formatarSexo(sexo?: string | null): string {
  const s = String(sexo || "").trim();
  if (!s) return "";
  const up = s.toUpperCase();
  if (up === "M" || up === "MASCULINO") return "Masculino";
  if (up === "F" || up === "FEMININO") return "Feminino";
  if (up === "OUTRO") return "Outro";
  return s;
}

function normalizarIdoso(bruto: any): Idoso {
  const idadeCalculada = calcularIdadeReal(bruto.data_nascimento);
  return {
    id: String(bruto.id || ""),
    nome: String(bruto.nome || "Paciente"),
    idade: idadeCalculada > 0 ? idadeCalculada : Number(bruto.idade || 0),
    cpf: bruto.cpf || null,
    data_nascimento: bruto.data_nascimento || null,
    sexo: bruto.sexo || null,
    telefone: bruto.telefone || bruto.telefone_emergencia || null,
    endereco: bruto.endereco || null,
    clinica_id: bruto.clinica_id || undefined,
    created_at: bruto.created_at || undefined,
    foto_url: bruto.foto_url || null,
  };
}

export default function PatientSelector({
  onSelect,
  selectedId,
}: PatientSelectorProps) {
  const [idosos, setIdosos] = useState<Idoso[]>([]);
  const [ativoId, setAtivoId] = useState<string>(selectedId || "");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  useEffect(() => {
    if (selectedId) {
      setAtivoId(selectedId);
    }
  }, [selectedId]);

  const carregarIdosos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const usuario = getUsuarioSessao();
    const userId = String(usuario?.id || "").trim();
    const perfil = normalizarPerfil(usuario?.perfil);

    // Evita marcar "sem vínculo" antes de o saspi_user estar disponível no estado
    if (!userId && perfil !== "ADMINISTRADOR" && perfil !== "ADMIN") {
      setCarregando(false);
      return;
    }

    const headers = getAuthHeaders(false);

    try {
      let listaNormalizada: Idoso[] = [];

      if (userId) {
        const resVinculos = await fetch(
          `${API_URL}/usuario-idoso/usuario/${userId}`,
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
                !usuario?.clinica_id ||
                !item.clinica_id ||
                item.clinica_id === usuario.clinica_id
            )
            .map(normalizarIdoso);

          const mapaUnico = new Map<string, Idoso>();
          extraidos.forEach((i: Idoso) => mapaUnico.set(i.id, i));
          listaNormalizada = Array.from(mapaUnico.values());
        }
      }

      if (
        listaNormalizada.length === 0 &&
        usuario?.clinica_id &&
        perfil !== "FAMILIAR"
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
      localStorage.setItem(
        "saspi_elderly_list",
        JSON.stringify(listaNormalizada)
      );

      if (listaNormalizada.length > 0) {
        let ativoStorage: Idoso | null = null;
        try {
          const raw = localStorage.getItem("saspi_active_elderly");
          if (raw) ativoStorage = JSON.parse(raw);
        } catch {}

        const idPreferencial = selectedIdRef.current || ativoStorage?.id;
        const encontrado =
          listaNormalizada.find((i) => i.id === idPreferencial) ||
          listaNormalizada[0];

        setAtivoId(encontrado.id);
        localStorage.setItem(
          "saspi_active_elderly",
          JSON.stringify(encontrado)
        );
        onSelectRef.current(encontrado);
      } else {
        setAtivoId("");
        localStorage.removeItem("saspi_active_elderly");
        localStorage.removeItem("saspi_elderly_list");
      }
    } catch {
      setErro("Não foi possível carregar a lista de pacientes vinculados.");
      setIdosos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarIdosos();

    function handleAtualizacaoExterna() {
      try {
        const raw = localStorage.getItem("saspi_active_elderly");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.id) {
            setAtivoId(parsed.id);
          }
        }
      } catch {}
    }

    window.addEventListener("saspi_user_updated", carregarIdosos);
    window.addEventListener("saspi_elderly_updated", handleAtualizacaoExterna);
    return () => {
      window.removeEventListener("saspi_user_updated", carregarIdosos);
      window.removeEventListener(
        "saspi_elderly_updated",
        handleAtualizacaoExterna
      );
    };
  }, [carregarIdosos]);

  function selecionarPaciente(idoso: Idoso) {
    setAtivoId(idoso.id);
    localStorage.setItem("saspi_active_elderly", JSON.stringify(idoso));
    window.dispatchEvent(new Event("saspi_elderly_updated"));
    onSelectRef.current(idoso);
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

  const pacienteAtivo = idosos.find((i) => i.id === ativoId) || idosos[0];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <Users size={15} className="text-[#1565C0]" />
        <span>Paciente em Acompanhamento ({idosos.length})</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {idosos.map((idoso) => {
          const ativo = idoso.id === ativoId;
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
                  {idoso.sexo ? ` • ${formatarSexo(idoso.sexo)}` : ""}
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

      {pacienteAtivo && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-gray-100 bg-[#F8FBFE] px-4 py-2.5 text-xs text-gray-600">
          {pacienteAtivo.data_nascimento && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-[#1565C0]" />
              <span>
                Nasc.:{" "}
                <strong className="font-semibold text-[#0A2540]">
                  {formatarDataBr(pacienteAtivo.data_nascimento)}
                </strong>
              </span>
            </span>
          )}

          {pacienteAtivo.sexo && (
            <span className="inline-flex items-center gap-1.5">
              <UserCheck size={13} className="text-[#1565C0]" />
              <span>
                Sexo:{" "}
                <strong className="font-semibold text-[#0A2540]">
                  {formatarSexo(pacienteAtivo.sexo)}
                </strong>
              </span>
            </span>
          )}

          {pacienteAtivo.cpf && (
            <span className="inline-flex items-center gap-1.5">
              <FileText size={13} className="text-[#1565C0]" />
              <span>
                CPF:{" "}
                <strong className="font-semibold text-[#0A2540]">
                  {formatarCpf(pacienteAtivo.cpf)}
                </strong>
              </span>
            </span>
          )}

          {pacienteAtivo.telefone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} className="text-[#26A69A]" />
              <span>
                Tel.:{" "}
                <strong className="font-semibold text-[#0A2540]">
                  {pacienteAtivo.telefone}
                </strong>
              </span>
            </span>
          )}

          {pacienteAtivo.endereco && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="shrink-0 text-[#1565C0]" />
              <span>
                Endereço:{" "}
                <strong className="font-semibold text-[#0A2540]">
                  {pacienteAtivo.endereco}
                </strong>
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}