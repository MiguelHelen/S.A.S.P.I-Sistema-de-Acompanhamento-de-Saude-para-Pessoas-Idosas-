type InfoCardProps = {
  label: string;
  title: string;
  subtitle: string;
};

export default function InfoCard({
  label,
  title,
  subtitle,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-600">
        {label}
      </p>

      <div className="mt-3">
        <p className="text-lg font-semibold text-[#0A2540]">
          {title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}