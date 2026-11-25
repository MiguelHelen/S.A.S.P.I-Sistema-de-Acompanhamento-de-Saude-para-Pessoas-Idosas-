"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface PontoGraficoSaude {
  horario: string;
  valor: number;
}

interface HealthChartProps {
  dados?: PontoGraficoSaude[];
}

export default function HealthChart({ dados = [] }: HealthChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={dados}
          margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSaude" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1565C0" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />

          <XAxis
            dataKey="horario"
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            labelStyle={{
              color: "#0A2540",
              fontWeight: 700,
              fontSize: "13px",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#1565C0",
              fontWeight: 600,
              fontSize: "13px",
            }}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #CBD5E1",
              boxShadow: "0 10px 15px -3px rgba(10, 37, 64, 0.12)",
              color: "#0A2540",
            }}
            formatter={(value) => [`${value} bpm`, "Frequência Cardíaca"]}
            labelFormatter={(label) => `Horário: ${label}`}
          />

          <Area
            type="monotone"
            dataKey="valor"
            stroke="#1565C0"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorSaude)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}