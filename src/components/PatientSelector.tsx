"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCheck, Users, UserPlus, Loader2, AlertCircle } from "lucide-react";

export interface Idoso {
  id: string;
  nome: string;
  idade: number;
  quarto?: string;
  sexo?: string;
  clinica_id?: string;
}

interface PatientSelectorProps {
  onSelect?: (idoso: Idoso) => void;
  selectedId?: string;
}

export default function PatientSelector({ onSelect, selectedId }: PatientSelectorProps) {
  const [listaIdosos, setListaIdosos] = useState<Idoso[]>([]);
  const [ativo, setAtivo] = useState<Idoso | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://perfect-bravery-production-5ce7.up.railway.app";

  function calcularIdade(dataNasc?: string): number {
    if (!dataNasc) return 70;
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade > 0 ? idade : 70;
  }

  async function carregarIdososDaClinica() {
    setCarregando(true);
    setErro("");

    const token = typeof window !== "undefined" ? localStorage.getItem("saspi_token") : null;
    const userRaw = typeof window !== "undefined" ? localStorage.getItem("saspi_user") : null;

    let clinicaId = "e63b19f5-d8e4-4973-bac6-12aba9a0545d"; // Fallback padrão

    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        const userData = parsed.user || parsed.usuario || parsed;
        clinicaId = userData.clinica_id || userData.clinicaId || clinicaId;
      } catch (e) {
        console.error("Erro ao ler usuário:", e);
      }
    }

    try {
      const res = await fetch(`${apiUrl}/idoso?clinica_id=${clinicaId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error(`Falha ao buscar idosos (Status ${res.status})`);
      }

      const data = await res.json();
      const idososRecebidos: Idoso[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        nome: item.nome,
        idade: item.idade || calcularIdade(item.data_nascimento),
        quarto: item.endereco || item.quarto || "Leito padrão",
        sexo: item.sexo,
        clinica_id: item.clinica_id,
      }));

      setListaIdosos(idososRecebidos);

      // Sincroniza qual idoso está selecionado
      const savedActiveRaw = localStorage.getItem("saspi_active_elderly");
      let idosoParaAtivar: Idoso | null = null;

      if (selectedId) {
        idosoParaAtivar = idososRecebidos.find((i) => i.id === selectedId) || null;
      } else if (savedActiveRaw) {
        try {
          const parsedSaved = JSON.parse(savedActiveRaw);
          idosoParaAtivar = idososRecebidos.find((i) => i.id === parsedSaved.id) || null;
        } catch {}
      }

      if (!idosoParaAtivar && idososRecebidos.length > 0) {
        idosoParaAtivar = idososRecebidos[0];
      }

      if (idosoParaAtivar) {
        setAtivo(idosoParaAtivar);
        localStorage.setItem("saspi_active_elderly", JSON.stringify(idosoParaAtivar));
        if (onSelect) onSelect(idosoParaAtivar);
      } else {
        setAtivo(null);
        localStorage.removeItem("saspi_active_elderly");
      }
    } catch (err: any) {
      console.warn("Aviso ao carregar idosos da API, verificando cache local:", err);

      const stored = localStorage.getItem("saspi_elderly_list");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setListaIdosos(parsed);
            const idosoSel = (selectedId && parsed.find((i: any) => i.id === selectedId)) || parsed[0];
            setAtivo(idosoSel);
            if (onSelect) onSelect(idosoSel);
            setCarregando(false);
            return;
          }
        } catch {}
      }
      setErro("Nenhum idoso disponível ou erro de conexão com a clínica.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarIdososDaClinica();

    window.addEventListener("saspi_elderly_updated", carregarIdososDaClinica);

    return () => {
      window.removeEventListener("saspi_elderly_updated", carregarIdososDaClinica);
    };
  }, [selectedId]);

  function handleSelect(idoso: Idoso) {
    setAtivo(idoso);
    try {
      localStorage.setItem("saspi_active_elderly", JSON.stringify(idoso));
      window.dispatchEvent(new Event("saspi_elderly_updated"));
    } catch (e) {
      console.error("Erro ao salvar idoso ativo:", e);
    }
    if (onSelect) {
      onSelect(idoso);
    }
  }

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
              Selecione o idoso para carregar os prontuários e sinais vitais.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/idosos/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1565C0]/20 bg-[#E8F1FB] px-4 py-2 text-sm font-medium text-[#1565C0] transition hover:bg-[#1565C0] hover:text-white"
        >
          <UserPlus size={16} />
          Novo Idoso
        </Link>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-5">
        {carregando ? (
          <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin text-[#1565C0]" />
            Carregando pacientes da clínica...
          </div>
        ) : listaIdosos.length === 0 ? (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertCircle size={18} className="text-amber-500" />
              Nenhum idoso cadastrado nesta clínica até o momento.
            </div>
            <Link
              href="/dashboard/idosos/novo"
              className="text-xs font-semibold text-[#1565C0] hover:underline"
            >
              Cadastrar o primeiro idoso &rarr;
            </Link>
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
                  <span
                    className={`text-xs ${
                      isSelected ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    ({idoso.idade} anos)
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}