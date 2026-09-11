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

const data = [
  { horario: "08h", valor: 70 },
  { horario: "10h", valor: 72 },
  { horario: "12h", valor: 71 },
  { horario: "14h", valor: 74 },
  { horario: "16h", valor: 73 },
  { horario: "18h", valor: 72 },
];

export default function HealthChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="horario"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            domain={[60, 90]}
            tick={{ fontSize: 12 }}
          />

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