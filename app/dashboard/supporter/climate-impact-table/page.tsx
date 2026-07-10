import Link from "next/link";

const baseTable = [
  { position: 1, club: "Arsenal", impact: 82351, co2: 18240 },
  { position: 2, club: "Liverpool", impact: 81904, co2: 16980 },
  { position: 3, club: "Chelsea", impact: 79210, co2: 15600 },
  { position: 4, club: "Manchester United", impact: 74800, co2: 13900 },
];

type PageProps = {
  searchParams: Promise<{
    amount?: string;
  }>;
};

export default async function ClimateImpactTablePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const parsedAmount = Number(params.amount ?? "0");
  const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

  const table = baseTable.map((row) =>
    row.club === "Arsenal"
      ? {
          ...row,
          impact: row.impact + amount,
        }
      : row
  );

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Impact Table
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Arsenal moved up the table
        </h1>

        <p className="mt-3 text-slate-300">
          Your £{amount} credit has contributed to your club&apos;s climate
          impact.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {table.map((row) => (
            <div
              key={row.club}
              className={`grid grid-cols-4 gap-4 border-b border-slate-800 p-5 ${
                row.club === "Arsenal"
                  ? "bg-green-400 text-slate-950"
                  : ""
              }`}
            >
              <strong>#{row.position}</strong>
              <strong>{row.club}</strong>
              <span>£{row.impact.toLocaleString()}</span>
              <span>{row.co2.toLocaleString()} kg CO₂</span>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard/supporter/calendar"
          className="mt-8 inline-block rounded-lg bg-green-400 px-6 py-3 font-bold text-slate-950"
        >
          Back to My Calendar
        </Link>
      </div>
    </main>
  );
}