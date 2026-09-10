type MetricCardProps = {
  title: string;
  value: string;
  unit?: string;
};

export default function MetricCard({
  title,
  value,
  unit,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-600">
        {title}
      </p>

      <div className="mt-3">
        <span className="text-3xl font-bold text-[#0A2540]">
          {value}
        </span>

        {unit && (
          <span className="ml-2 text-sm text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}