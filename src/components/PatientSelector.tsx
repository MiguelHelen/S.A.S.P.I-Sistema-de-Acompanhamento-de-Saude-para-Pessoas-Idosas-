"use client";

import { useState, useEffect } from "react";
import { UserCheck, ChevronDown } from "lucide-react";

export interface Idoso {
  id: string;
  nome: string;
  idade: number;
  quarto?: string;
}

const IDOSOS_MOCK: Idoso[] = [
  { id: "1", nome: "Dona Francisca Silva", idade: 78, quarto: "Quarto 102" },
  { id: "2", nome: "Sr. Antônio Oliveira", idade: 82, quarto: "Quarto 204" },
  { id: "3", nome: "Dona Maria Lurdes", idade: 74, quarto: "Quarto 108" },
];

interface PatientSelectorProps {
  onSelect: (idoso: Idoso) => void;
  selectedId?: string;
}

export default function PatientSelector({
  onSelect,
  selectedId,
}: PatientSelectorProps) {
  const [selected, setSelected] = useState<Idoso>(IDOSOS_MOCK[0]);

  // Sincroniza estado visual e storage quando selectedId externo mudar
  useEffect(() => {
    if (selectedId) {
      const match = IDOSOS_MOCK.find((i) => i.id === selectedId);
      if (match && match.id !== selected.id) {
        setSelected(match);
        localStorage.setItem("saspi_active_elderly", JSON.stringify(match));
      }
    }
  }, [selectedId, selected.id]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const found = IDOSOS_MOCK.find((i) => i.id === e.target.value);
    if (found) {
      setSelected(found);
      onSelect(found);
      localStorage.setItem("saspi_active_elderly", JSON.stringify(found));
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-[#E8F1FB] p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#1565C0] shadow-sm">
          <UserCheck size={22} />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1565C0]">
            Paciente em Acompanhamento
          </span>
          <p className="font-bold text-[#0A2540]">
            {selected.nome}, {selected.idade} anos
          </p>
          {selected.quarto && (
            <span className="text-xs text-gray-500">{selected.quarto}</span>
          )}
        </div>
      </div>

      <div className="relative">
        <select
          value={selected.id}
          onChange={handleChange}
          aria-label="Selecionar paciente idoso"
          className="w-full appearance-none rounded-xl border border-[#BFD8F2] bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-[#0A2540] shadow-sm outline-none transition focus:border-[#1565C0] sm:w-auto"
        >
          {IDOSOS_MOCK.map((idoso) => (
            <option key={idoso.id} value={idoso.id}>
              {idoso.nome} ({idoso.idade} anos)
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>
    </div>
  );
}