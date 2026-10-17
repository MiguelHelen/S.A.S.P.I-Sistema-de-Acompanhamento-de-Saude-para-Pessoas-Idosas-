"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="horario" tick={{ fontSize: 12 }} />

          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="valor"
            stroke="#1565C0"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#1565C0",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}