type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

export default function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Score-For-Our Planet
      </p>

      <h1 className="mt-3 text-5xl font-black">
        {title}
      </h1>

      <p className="mt-4 max-w-3xl text-lg text-slate-300">
        {subtitle}
      </p>
    </>
  );
}