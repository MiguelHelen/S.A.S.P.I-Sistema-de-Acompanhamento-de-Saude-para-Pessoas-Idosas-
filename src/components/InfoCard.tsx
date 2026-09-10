import type { ReactNode } from "react";

type InfoCardProps = {
  label: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
};

export default function InfoCard({
  label,
  title,
  subtitle,
  icon,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-blue-950/5 transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-gray-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-[#0A2540]">
        {title}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}