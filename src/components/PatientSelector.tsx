"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { UserCheck, Users, Loader2, AlertCircle } from "lucide-react";

export interface Idoso {
  id: string;
  nome: string;
  idade: number;
  quarto?: string;
  sexo?: string;
  clinica_id?: string;
  data_nascimento?: string;
}

interface PatientSelectorProps {
  onSelect?: (idoso: Idoso) => void;
  selectedId?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export function calcularIdadeReal(dataNasc?: string): number {
  if (!dataNasc) return 0;
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  if (Number.isNaN(nasc.getTime())) return 0;
  let idade = hoje.getUTCFullYear() - nasc.getUTCFullYear();
  const mes = hoje.getUTCMonth() - nasc.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoje.getUTCDate() < nasc.getUTCDate())) {
    idade--;
  }
  return idade >= 0 && idade <= 130 ? idade : 0;
}

export default function PatientSelector({
  onSelect,
  selectedId,
}: PatientSelectorProps) {
  const [listaIdosos, setListaIdosos] = useState<Idoso[]>([]);
  const [ativo, setAtivo] = useState<Idoso | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [perfilUsuario, setPerfilUsuario] = useState<string>("");

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const carregarIdososAutorizados = useCallback(async () => {
    setCarregando(true);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("saspi_token") : null;
    const userRaw =
      typeof window !== "undefined" ? localStorage.getItem("saspi_user") : null;

    let perfil = "";
    let userId = "";

    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        const userData = parsed.user || parsed.usuario || parsed;
        perfil = String(userData.perfil || userData.role || "").toUpperCase();
        userId = userData.id || "";
        setPerfilUsuario(perfil);
      } catch {}
    }

    if (!userId || !token) {
      setListaIdosos([]);
      setAtivo(null);
      setCarregando(false);
      return;
    }

    try {
      // Busca direta na rota de vinculos do usuario que ja traz include: { idoso: true }
      const resVinculos = await fetch(
        `${API_URL}/usuario-idoso/usuario/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let idososVinculados: Idoso[] = [];

      if (resVinculos.ok) {
        const vinculosData = await resVinculos.json();
        const arrayVinculos = Array.isArray(vinculosData)
          ? vinculosData
          : vinculosData.data || [];

        const mapaUnico = new Map<string, Idoso>();

        arrayVinculos.forEach((v: any) => {
          const item = v.idoso;
          if (item && item.id && !mapaUnico.has(item.id)) {
            mapaUnico.set(item.id, {
              id: item.id,
              nome: item.nome,
              idade: calcularIdadeReal(item.data_nascimento),
              quarto: item.endereco || "Leito não informado",
              sexo: item.sexo,
              clinica_id: item.clinica_id,
              data_nascimento: item.data_nascimento,
            });
          }
        });

        idososVinculados = Array.from(mapaUnico.values());
      }

      setListaIdosos(idososVinculados);
      localStorage.setItem(
        "saspi_elderly_list",
        JSON.stringify(idososVinculados)
      );

      const savedActiveRaw = localStorage.getItem("saspi_active_elderly");
      let idosoParaAtivar: Idoso | null = null;

      if (selectedId) {
        idosoParaAtivar =
          idososVinculados.find((i) => i.id === selectedId) || null;
      } else if (savedActiveRaw) {
        try {
          const parsedSaved = JSON.parse(savedActiveRaw);
          idosoParaAtivar =
            idososVinculados.find((i) => i.id === parsedSaved.id) || null;
        } catch {}
      }

      if (!idosoParaAtivar && idososVinculados.length > 0) {
        idosoParaAtivar = idososVinculados[0];
      }

      if (idosoParaAtivar) {
        setAtivo(idosoParaAtivar);
        localStorage.setItem(
          "saspi_active_elderly",
          JSON.stringify(idosoParaAtivar)
        );
        onSelectRef.current?.(idosoParaAtivar);
      } else {
        setAtivo(null);
        localStorage.removeItem("saspi_active_elderly");
        window.dispatchEvent(new Event("saspi_elderly_updated"));
      }
    } catch {
      setListaIdosos([]);
      setAtivo(null);
    } finally {
      setCarregando(false);
    }
  }, [selectedId]);

  useEffect(() => {
    carregarIdososAutorizados();

    function handleElderlyUpdate() {
      const savedActiveRaw = localStorage.getItem("saspi_active_elderly");
      if (savedActiveRaw) {
        try {
          const parsed = JSON.parse(savedActiveRaw);
          if (parsed && parsed.id) {
            setAtivo(parsed);
          }
        } catch {}
      } else {
        setAtivo(null);
      }
    }

    window.addEventListener("saspi_elderly_updated", handleElderlyUpdate);
    return () => {
      window.removeEventListener("saspi_elderly_updated", handleElderlyUpdate);
    };
  }, [carregarIdososAutorizados]);

  function handleSelect(idoso: Idoso) {
    if (perfilUsuario === "FAMILIAR" && listaIdosos.length <= 1) return;
    setAtivo(idoso);
    try {
      localStorage.setItem("saspi_active_elderly", JSON.stringify(idoso));
      window.dispatchEvent(new Event("saspi_elderly_updated"));
    } catch {}
    onSelectRef.current?.(idoso);
  }

  const isFamiliarUnico =
    perfilUsuario === "FAMILIAR" && listaIdosos.length === 1;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0A2540]">
              Paciente em Acompanhamento
            </h2>
            <p className="text-sm text-gray-500">
              {isFamiliarUnico
                ? "Visualização dedicada ao paciente vinculado à sua conta."
                : "Selecione o paciente vinculado para visualizar os prontuários e sinais vitais."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-5">
        {carregando ? (
          <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin text-[#1565C0]" />
            Carregando pacientes vinculados...
          </div>
        ) : listaIdosos.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
            <AlertCircle size={18} className="shrink-0 text-amber-500" />
            <p className="text-sm text-gray-500">
              Nenhum paciente atribuído ao seu usuário até o momento. Solicite o
              vínculo à administração da clínica.
            </p>
          </div>
        ) : isFamiliarUnico && ativo ? (
          <div className="inline-flex items-center gap-2.5 rounded-xl bg-[#1565C0] px-4 py-2.5 text-sm font-medium text-white shadow-sm">
            <UserCheck size={16} className="text-white" />
            <span>{ativo.nome}</span>
            {ativo.idade > 0 && (
              <span className="text-xs text-blue-100">
                ({ativo.idade} anos)
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            {listaIdosos.map((idoso) => {
              const isSelected = ativo?.id === idoso.id;
              return (
                <button
                  key={idoso.id}
                  type="button"
                  onClick={() => handleSelect(idoso)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isSelected
                      ? "bg-[#1565C0] text-white shadow-sm ring-2 ring-[#1565C0]/20"
                      : "border border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-200 hover:bg-[#F2F7FB]"
                  }`}
                >
                  <UserCheck
                    size={16}
                    className={isSelected ? "text-white" : "text-gray-400"}
                  />
                  <span>{idoso.nome}</span>
                  {idoso.idade > 0 && (
                    <span
                      className={`text-xs ${
                        isSelected ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      ({idoso.idade} anos)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}