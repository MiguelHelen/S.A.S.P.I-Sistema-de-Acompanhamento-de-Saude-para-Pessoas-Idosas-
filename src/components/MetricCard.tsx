import type { ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: string;
  unit?: string;
  icon: ReactNode;
};

export default function MetricCard({
  title,
  value,
  unit,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-blue-950/5 transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#1565C0]">
          {icon}
        </div>

        <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
          Atual
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-gray-600">
        {title}
      </p>

      <div className="mt-2">
        <span className="text-3xl font-bold tracking-tight text-[#0A2540]">
          {value}
        </span>

        {unit && (
          <span className="ml-2 text-sm font-medium text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}