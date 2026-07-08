type StatCardProps = {
  title: string;
  value: string;
  icon: string;
};

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="text-4xl">{icon}</div>

      <h3 className="mt-4 text-sm text-slate-400">
        {title}
      </h3>

      <p className="mt-2 text-4xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}