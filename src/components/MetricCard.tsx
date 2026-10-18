import type { ReactNode } from "react";

export type StatusClinicoTone = "normal" | "warning" | "critical" | "neutral";

export interface AvaliacaoClinica {
  label: string;
  tone: StatusClinicoTone;
  alerta?: string;
}

export interface AlertaClinicoItem {
  id: string;
  indicador: string;
  valorFormatado: string;
  nivel: "warning" | "critical";
  mensagem: string;
  referencia: string;
}

export function avaliarIndicadorClinico(
  tipo: "fc" | "spo2" | "temp" | "pa",
  valorBruto: string
): AvaliacaoClinica {
  const limpo = String(valorBruto || "").trim();
  if (!limpo || limpo === "--" || limpo === "--/--") {
    return { label: "Sem leitura", tone: "neutral" };
  }

  if (tipo === "fc") {
    const num = Number(limpo.replace(",", "."));
    if (Number.isNaN(num)) return { label: "Atual", tone: "neutral" };
    if (num < 50) {
      return {
        label: "Crítico (Baixa)",
        tone: "critical",
        alerta: `Frequência cardíaca muito abaixo do nível seguro (${num} bpm — Bradicardia acentuada).`,
      };
    }
    if (num < 60) {
      return {
        label: "Abaixo do padrão",
        tone: "warning",
        alerta: `Frequência cardíaca abaixo do padrão seguro (${num} bpm — Bradicardia).`,
      };
    }
    if (num > 120) {
      return {
        label: "Crítico (Alta)",
        tone: "critical",
        alerta: `Frequência cardíaca muito acima do nível seguro (${num} bpm — Taquicardia acentuada).`,
      };
    }
    if (num > 100) {
      return {
        label: "Acima do padrão",
        tone: "warning",
        alerta: `Frequência cardíaca acima do padrão em repouso (${num} bpm — Taquicardia).`,
      };
    }
    return { label: "Normal", tone: "normal" };
  }

  if (tipo === "spo2") {
    const num = Number(limpo.replace(",", "."));
    if (Number.isNaN(num)) return { label: "Atual", tone: "neutral" };
    if (num < 90) {
      return {
        label: "Crítico (Hipóxia)",
        tone: "critical",
        alerta: `Oxigenação em nível crítico (${num}%). Requer avaliação imediata.`,
      };
    }
    if (num < 95) {
      return {
        label: "Abaixo do padrão",
        tone: "warning",
        alerta: `Oxigenação abaixo do ideal (${num}%). Atenção recomendada.`,
      };
    }
    return { label: "Normal", tone: "normal" };
  }

  if (tipo === "temp") {
    const num = Number(limpo.replace(",", "."));
    if (Number.isNaN(num)) return { label: "Atual", tone: "neutral" };
    if (num >= 38.0) {
      return {
        label: "Alerta (Febre)",
        tone: "critical",
        alerta: `Temperatura corporal elevada (${num} °C — Febre).`,
      };
    }
    if (num >= 37.3) {
      return {
        label: "Estado febril",
        tone: "warning",
        alerta: `Temperatura levemente elevada (${num} °C — Subfebril).`,
      };
    }
    if (num < 35.5) {
      return {
        label: "Abaixo do padrão",
        tone: "warning",
        alerta: `Temperatura corporal abaixo do padrão (${num} °C — Hipotermia).`,
      };
    }
    return { label: "Normal", tone: "normal" };
  }

  if (tipo === "pa") {
    const match = limpo.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
    if (!match) return { label: "Atual", tone: "neutral" };
    const sistolica = Number(match[1]);
    const diastolica = Number(match[2]);

    if (sistolica >= 180 || diastolica >= 110) {
      return {
        label: "Crítico (Alta)",
        tone: "critical",
        alerta: `Pressão arterial em nível crítico (${sistolica}/${diastolica} mmHg).`,
      };
    }
    if (sistolica >= 140 || diastolica >= 90) {
      return {
        label: "Acima do padrão",
        tone: "warning",
        alerta: `Pressão arterial elevada (${sistolica}/${diastolica} mmHg).`,
      };
    }
    if (sistolica < 90 || diastolica < 60) {
      return {
        label: "Abaixo do padrão",
        tone: "warning",
        alerta: `Pressão arterial baixa (${sistolica}/${diastolica} mmHg — Hipotensão).`,
      };
    }
    return { label: "Normal", tone: "normal" };
  }

  return { label: "Atual", tone: "neutral" };
}

export function gerarAlertasClinicos(metricas: {
  fc?: string;
  spo2?: string;
  temp?: string;
  pa?: string;
}): AlertaClinicoItem[] {
  const alertas: AlertaClinicoItem[] = [];

  if (metricas.fc) {
    const av = avaliarIndicadorClinico("fc", metricas.fc);
    if (av.alerta && (av.tone === "warning" || av.tone === "critical")) {
      alertas.push({
        id: "alerta-fc",
        indicador: "Frequência Cardíaca",
        valorFormatado: `${metricas.fc} bpm`,
        nivel: av.tone,
        mensagem: av.alerta,
        referencia: "Referência segura: 60 a 100 bpm",
      });
    }
  }

  if (metricas.spo2) {
    const av = avaliarIndicadorClinico("spo2", metricas.spo2);
    if (av.alerta && (av.tone === "warning" || av.tone === "critical")) {
      alertas.push({
        id: "alerta-spo2",
        indicador: "Oxigenação (SpO₂)",
        valorFormatado: `${metricas.spo2}%`,
        nivel: av.tone,
        mensagem: av.alerta,
        referencia: "Referência segura: ≥ 95%",
      });
    }
  }

  if (metricas.pa) {
    const av = avaliarIndicadorClinico("pa", metricas.pa);
    if (av.alerta && (av.tone === "warning" || av.tone === "critical")) {
      alertas.push({
        id: "alerta-pa",
        indicador: "Pressão Arterial",
        valorFormatado: `${metricas.pa} mmHg`,
        nivel: av.tone,
        mensagem: av.alerta,
        referencia: "Referência segura: < 140/90 e ≥ 90/60 mmHg",
      });
    }
  }

  if (metricas.temp) {
    const av = avaliarIndicadorClinico("temp", metricas.temp);
    if (av.alerta && (av.tone === "warning" || av.tone === "critical")) {
      alertas.push({
        id: "alerta-temp",
        indicador: "Temperatura Corporal",
        valorFormatado: `${metricas.temp} °C`,
        nivel: av.tone,
        mensagem: av.alerta,
        referencia: "Referência segura: 35,5 °C a 37,2 °C",
      });
    }
  }

  return alertas;
}

type MetricCardProps = {
  title: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  statusLabel?: string;
  statusTone?: StatusClinicoTone;
};

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  statusLabel,
  statusTone = "neutral",
}: MetricCardProps) {
  const badgeClasses =
    statusTone === "critical"
      ? "bg-red-50 text-red-700 ring-1 ring-red-200"
      : statusTone === "warning"
        ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
        : statusTone === "normal"
          ? "bg-[#E6F4EF] text-[#20877E]"
          : "bg-gray-50 text-gray-500";

  const borderClasses =
    statusTone === "critical"
      ? "border-red-200"
      : statusTone === "warning"
        ? "border-amber-200"
        : "border-gray-100";

  return (
    <div
      className={`rounded-2xl border ${borderClasses} bg-white p-6 shadow-lg shadow-blue-950/5 transition hover:-translate-y-0.5 hover:shadow-xl`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#1565C0]">
          {icon}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses}`}
        >
          {statusLabel || "Atual"}
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-gray-600">{title}</p>

      <div className="mt-2">
        <span className="text-3xl font-bold tracking-tight text-[#0A2540]">
          {value}
        </span>

        {unit && (
          <span className="ml-2 text-sm font-medium text-gray-500">{unit}</span>
        )}
      </div>
    </div>
  );
}