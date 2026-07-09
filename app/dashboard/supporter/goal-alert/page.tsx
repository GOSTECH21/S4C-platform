"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const sportEvents: Record<string, { label: string; emoji: string }> = {
  Football: { label: "GOAL!", emoji: "⚽" },
  Rugby: { label: "TRY!", emoji: "🏉" },
  Cricket: { label: "WICKET!", emoji: "🏏" },
};

const sponsorGroups: Record<string, { name: string; amount: number }[]> = {
  Football: [
    { name: "🍺 Budweiser", amount: 1 },
    { name: "🥤 Coca-Cola", amount: 1 },
    { name: "🪒 Gillette", amount: 1 },
  ],
  Rugby: [
    { name: "🍺 Guinness", amount: 1 },
    { name: "⚡ ScottishPower", amount: 1 },
    { name: "🏦 Royal Bank of Scotland", amount: 1 },
  ],
  Cricket: [
    { name: "🫖 Yorkshire Tea", amount: 1 },
    { name: "✈️ Emirates", amount: 1 },
    { name: "👓 Specsavers", amount: 1 },
  ],
};

export default function GoalAlertPage() {
  const searchParams = useSearchParams();

  const sport = searchParams.get("sport") || "Football";
  const team = searchParams.get("team") || "Arsenal";
  const score = searchParams.get("score") || "Arsenal 1 - 0 Liverpool";

  const event = sportEvents[sport] || sportEvents.Football;
  const sponsors = sponsorGroups[sport] || sponsorGroups.Football;
  const total = sponsors.reduce((sum, sponsor) => sum + sponsor.amount, 0);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-8 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-green-400 bg-slate-900 p-10 text-center shadow-2xl">
        <div className="text-7xl">{event.emoji}</div>

        <h1 className="mt-6 text-5xl font-black text-green-400">
          {event.label}
        </h1>

        <p className="mt-4 text-2xl font-bold">{score}</p>

        <p className="mt-4 text-slate-300">
          Congratulations! {team} have unlocked climate credits.
        </p>

        <h2 className="mt-8 text-2xl font-bold">
          Three sponsors have released Climate Credits
        </h2>

        <div className="mt-6 space-y-4 text-left">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="rounded-xl border border-slate-700 bg-slate-950 p-5"
            >
              <h3 className="text-xl font-bold">{sponsor.name}</h3>
              <p className="mt-2 text-green-400">
                £{sponsor.amount} Climate Credit Ready
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Total Climate Credit Available
        </p>

        <p className="mt-2 text-5xl font-black text-green-400">£{total}</p>

        <p className="mt-3 text-slate-300">
          Claim all sponsor credits and allocate them to verified climate
          projects.
        </p>

        <Link
          href={`/dashboard/supporter/projects?amount=${total}`}
          className="mt-8 inline-block rounded-xl bg-green-400 px-8 py-4 text-xl font-bold text-slate-950"
        >
          Claim All £{total}
        </Link>
      </div>
    </main>
  );
}